import {useCallback, useEffect, useRef, useState} from 'react';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import {Alert, PermissionsAndroid, Platform} from 'react-native';

type Options = {
  language?: string;
  onResultText?: (text: string) => void;
};

export function useVoiceInput({
  language = 'ko-KR',
  onResultText,
}: Options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const inFlightRef = useRef(false);

  useEffect(() => {
    const onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      setRecognizedText(text);
      onResultText?.(text);
    };
    const onSpeechError = (e: SpeechErrorEvent) => {
      const msg = e.error?.message || '음성 인식 중 오류가 발생했습니다.';
      console.warn('[Voice Error]', msg);
      setIsListening(false);
      inFlightRef.current = false;
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().catch(() => {});
      Voice.removeAllListeners();
    };
  }, [onResultText]);

  const ensurePermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (granted) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: '마이크 권한 요청',
        message: '음성 인식을 위해 마이크 권한이 필요합니다.',
        buttonPositive: '허용',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const startListening = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const ok = await ensurePermission();
    if (!ok) {
      Alert.alert('권한 필요', '마이크 권한을 허용해주세요.');
      inFlightRef.current = false;
      return;
    }
    try {
      setRecognizedText('');
      await Voice.start(language);
      setIsListening(true);
    } catch (e: any) {
      console.warn('[Voice start error]', e?.message);
      setIsListening(false);
    } finally {
      inFlightRef.current = false;
    }
  }, [ensurePermission, language]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch {}
    setIsListening(false);
  }, []);

  const resetText = useCallback(() => {
    setRecognizedText('');
  }, []);

  return {
    isListening,
    recognizedText,
    startListening,
    stopListening,
    resetText,
  };
}
