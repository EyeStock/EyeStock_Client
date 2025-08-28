import React, {useEffect, useRef, useState} from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import styled from 'styled-components/native';
import {
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import {API_BASE_URL} from '@env';
import TtsArea from '../components/TtsArea';
import NewsComponent from '../components/NewsComponent';

export default function SpeechToTextScreen() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const inFlightRef = useRef(false);

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
      await Voice.stop().catch(() => {});
      await Voice.cancel().catch(() => {});
      await new Promise(r => setTimeout(r, 120));
      console.log('[Voice] Start...');
      await Voice.start('ko-KR');
      console.log('[Voice] Start 성공');
    } catch (e) {
      console.error('[Voice.start 실패]', e);
      await new Promise(r => setTimeout(r, 250));
      try {
        await Voice.start('ko-KR');
      } catch {}
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
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    startListening();

    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') startListening();
      else Voice.stop().catch(() => {});
    });

    return () => {
      sub.remove();
      Voice.stop().catch(() => {});
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = async (e: SpeechResultsEvent) => {
    const text = e.value?.[0] || '';
    console.log('인식 결과:', text);
    setRecognizedText(text);

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setLoading(true);
      setApiResponse('');

      const res = await fetch(`${API_BASE_URL}/api/v1/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({message: text}),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        console.warn('API 비정상 상태:', res.status, t);
        setApiResponse(`(오류 ${res.status})`);
        return;
      }

      const data = await res.json();
      console.log('API 응답:', data);
      const answer =
        data?.data?.answer ?? data?.answer ?? data?.message ?? '(응답 없음)';
      setApiResponse(answer);
    } catch (error) {
      console.error('API 호출 오류:', error);
      setApiResponse('(오류 발생)');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const onSpeechError = (event: SpeechErrorEvent) => {
    console.error('[Speech Error]', event);
    setIsListening(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container onPress={startListening}>
        <Title>말해주세요.</Title>
        {isListening && <ListeningText>입력 중입니다...</ListeningText>}

        <Bubble>
          <RecognizedText>{recognizedText || '...'}</RecognizedText>
        </Bubble>

        {loading ? (
          <NewsComponent url="https://news.mt.co.kr/mtview.php?no=2025082813314052084" />
        ) : (
          <TtsArea ttsText={apiResponse || '응답을 기다리는 중...'}>
            {apiResponse || '응답을 기다리는 중...'}
          </TtsArea>
        )}

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
  padding: 16px;
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
