import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '@env';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
AsyncStorage.getItem('accessToken').then(t => {
  console.log(
    '[STORED accessToken]',
    t ? `${t.slice(0, 16)}... len=${t.length}` : '(none)',
  );
});
AsyncStorage.getItem('refreshToken').then(t => {
  console.log(
    '[STORED refreshToken]',
    t ? `${t.slice(0, 16)}... len=${t.length}` : '(none)',
  );
});
instance.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  console.log('[REQ]', config.method, fullUrl, {
    auth: config.headers?.Authorization ? 'set' : 'none',
    body:
      typeof config.data === 'string'
        ? config.data
        : JSON.stringify(config.data),
  });

  return config;
});
instance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log('토큰 만료됨! refreshToken으로 재발급 필요');
    }
    return Promise.reject(error);
  },
);

export default instance;
