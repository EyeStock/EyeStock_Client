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
import TtsArea from '../components/TtsArea';
import NewsComponent from '../components/NewsComponent';
import api from '../api/instance';

export default function SpeechToTextScreen() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);

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
      setIsListening(true);
    };
    Voice.onSpeechEnd = () => {
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

  const fetchNewsUrls = async (question: string) => {
    try {
      const res = await api.post('/api/v1/news', {
        question,
        days: 7,
        max_links: 5,
      });
      const data = res.data;
      const urls: string[] =
        data?.data?.urls ??
        data?.data?.links ??
        data?.urls ??
        data?.links ??
        [];
      return Array.isArray(urls) ? urls : [];
    } catch (e: any) {
      const status = e?.response?.status;
      console.warn('뉴스 API 오류:', status ?? e?.message);
      return [];
    }
  };

  const onSpeechResults = async (e: SpeechResultsEvent) => {
    const text = e.value?.[0] || '';
    setRecognizedText(text);

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setLoading(true);
      setApiResponse('');
      setSources([]);
      const [chatRes, newsUrls] = await Promise.all([
        (async () => {
          try {
            const res = await api.post('/api/v1/chat/ask', {message: text});
            const data = res.data;
            const answer =
              data?.data?.answer ??
              data?.answer ??
              data?.message ??
              '(응답 없음)';
            return {answer};
          } catch (e: any) {
            const status = e?.response?.status;
            console.warn('ASK API 오류:', status ?? e?.message);
            return {answer: status ? `(오류 ${status})` : '(오류 발생)'};
          }
        })(),
        fetchNewsUrls(text),
      ]);

      setApiResponse(chatRes.answer);
      setSources(newsUrls);
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

        {sources.length > 0 ? (
          <NewsComponent url={sources} question={recognizedText} />
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
