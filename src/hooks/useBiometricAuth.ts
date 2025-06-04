import ReactNativeBiometrics from 'react-native-biometrics';
import DeviceInfo from 'react-native-device-info';
import {
  biometricSignup,
  biometricLoginStart,
  biometricLoginVerify,
} from '../api/auth';

export const useBiometricAuth = () => {
  const login = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const deviceId = await DeviceInfo.getUniqueId();

    try {
      console.log('[biometricLoginStart 요청]', deviceId);
      const {data: challengeData} = await biometricLoginStart(deviceId);
      const challenge = challengeData.challenge;

      const {signature} = await rnBiometrics.createSignature({
        promptMessage: '지문 인증',
        payload: challenge,
      });
      if (!signature) {
        throw new Error('지문 서명이 생성되지 않았습니다.');
      }

      const {data: token} = await biometricLoginVerify(
        deviceId,
        challenge,
        signature,
      );

      console.log('[로그인 성공]', token);
      return token;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('[등록되지 않은 디바이스] → biometricSignup 수행');

        const {publicKey} = await rnBiometrics.createKeys();
        await biometricSignup(deviceId, publicKey);

        return await login();
      }

      console.error('[지문 인증 실패]', error?.response?.data || error.message);
      throw error;
    }
  };

  return {login};
};
