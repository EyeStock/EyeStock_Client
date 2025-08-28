import React, {useEffect, useState} from 'react';
import Voice from '@react-native-voice/voice';
import styled from 'styled-components/native';
import {
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {API_BASE_URL} from '@env';
import TtsArea from '../components/TtsArea';

export default function SpeechToTextScreen() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const navigation = useNavigation();

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (alreadyGranted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한 요청',
          message:
            '음성 인식을 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) return true;

      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          '권한 필요',
          '설정에서 마이크 권한을 수동으로 허용해야 음성 인식이 가능합니다.',
          [
            {text: '취소', style: 'cancel'},
            {text: '설정 열기', onPress: () => Linking.openSettings()},
          ],
        );
      }

      return false;
    }

    return true;
  };

  const startListening = async () => {
    const granted = await requestMicrophonePermission();
    if (!granted) {
      console.warn('마이크 권한 거부됨');
      return;
    }

    try {
      console.log('[Voice] Start 직전');
      await Voice.start('ko-KR');
      console.log('[Voice] Start 성공');
    } catch (e) {
      console.error('[Voice.start 실패]', JSON.stringify(e, null, 2));
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log('인식 시작');
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      console.log('인식 종료');
      setIsListening(false);
    };

    Voice.onSpeechResults = async e => {
      const text = e.value?.[0] || '';
      console.log('인식 결과:', text);
      setRecognizedText(text);

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: text,
          }),
        });

        const data = await response.json();
        console.log('API 응답:', data);
        setApiResponse(data.data.answer || '(응답 없음)');
      } catch (error) {
        console.error('API 호출 오류:', error);
        setApiResponse('(오류 발생)');
      }
    };

    Voice.onSpeechError = event => {
      console.error('[Speech Error]', event);
      setIsListening(false);
    };

    startListening();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container onPress={startListening}>
        <Title>말해주세요.</Title>
        {isListening && <ListeningText>입력 중입니다...</ListeningText>}

        <Bubble>
          <RecognizedText>{recognizedText || '...'}</RecognizedText>
        </Bubble>

        <TtsArea ttsText={apiResponse || '응답을 기다리는 중...'}>
          {apiResponse || '응답을 기다리는 중...'}
        </TtsArea>

        <Footer>다시 말하고 싶으면 탭</Footer>
      </Container>
    </TouchableWithoutFeedback>
  );
}

const Container = styled.Pressable`
  flex: 1;
  background-color: ${({theme}) => theme.color.white};
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${({theme}) => theme.color.black};
  font-family: ${({theme}) => theme.font.regular};
`;

const ListeningText = styled.Text`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 12px;
  font-family: ${({theme}) => theme.font.regular};
`;

const Bubble = styled.View`
  background-color: ${({theme}) => theme.color.primary};
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  width: 80%;
`;

const RecognizedText = styled.Text`
  color: ${({theme}) => theme.color.white};
  font-size: 20px;
  text-align: center;
  font-family: ${({theme}) => theme.font.regular};
`;

const Footer = styled.Text`
  font-size: 16px;
  color: ${({theme}) => theme.color.black};
  position: absolute;
  bottom: 40px;
  font-family: ${({theme}) => theme.font.regular};
`;
