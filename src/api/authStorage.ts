import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTokens = async (accessToken: string, refreshToken: string) =>
  AsyncStorage.multiSet([
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
  ]);

export const clearTokens = () =>
  AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

export const getAccessToken = () => AsyncStorage.getItem('accessToken');
export const getRefreshToken = () => AsyncStorage.getItem('refreshToken');
