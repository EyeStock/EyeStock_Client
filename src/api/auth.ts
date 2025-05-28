import axios from 'axios';

const API_BASE_URL = 'http://15.165.68.253:8080/api/v1';

export const biometricSignup = async (deviceId: string, publicKey: string) => {
  const url = `${API_BASE_URL}/auth/biometric-signup`;
  const body = {deviceId, publicKey};
  console.log('[biometricSignup] 요청:', {url, body});

  try {
    const response = await axios.post(url, body);
    console.log('[biometricSignup] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      '[biometricSignup] 에러 발생:',
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const biometricLoginStart = async (deviceId: string) => {
  const url = `${API_BASE_URL}/auth/biometric-login/start`;
  const body = {deviceId};
  console.log('[biometricLoginStart] 요청:', {url, body});

  try {
    const response = await axios.post(url, body);
    console.log('[biometricLoginStart] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      '[biometricLoginStart] 에러 발생:',
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const biometricLoginVerify = async (
  deviceId: string,
  challenge: string,
  signature: string,
) => {
  const url = `${API_BASE_URL}/auth/biometric-login/verify`;
  const body = {deviceId, challenge, signature};
  console.log('[biometricLoginVerify] 요청:', {url, body});

  try {
    const response = await axios.post(url, body);
    console.log('[biometricLoginVerify] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      '[biometricLoginVerify] 에러 발생:',
      error?.response?.data || error.message,
    );
    throw error;
  }
};
