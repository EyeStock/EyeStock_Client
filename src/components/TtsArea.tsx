import React, {useEffect} from 'react';
import Tts from 'react-native-tts';
import styled from 'styled-components/native';

interface Props {
  children: React.ReactNode;
  ttsText: string;
}
console.log('[TTS Check]', Tts);
export default function TtsArea({children, ttsText}: Props) {
  useEffect(() => {
    if (Tts && typeof Tts.setDefaultLanguage === 'function') {
      Tts.setDefaultLanguage('ko-KR');
    } else {
      console.warn('TTS 모듈이 제대로 연결되지 않았습니다.');
    }
  }, []);

  const speak = () => {
    Tts.stop();
    Tts.speak(ttsText);
  };

  return (
    <SpeechBubble onPress={speak}>
      <BubbleTail />
      <BubbleText>{children}</BubbleText>
    </SpeechBubble>
  );
}

const SpeechBubble = styled.Pressable`
  background-color: ${({theme}) => theme.color.black ?? 'black'};
  padding: 20px 24px;
  margin: 20px auto;
  border-radius: 24px;
  position: relative;
  width: 85%;
  max-width: 350px;
`;

const BubbleTail = styled.View`
  position: absolute;
  bottom: -16px;
  left: 32px;
  width: 0;
  height: 0;
  border-left-width: 12px;
  border-right-width: 12px;
  border-top-width: 16px;
  border-style: solid;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${({theme}) => theme.color.black ?? 'black'};
`;

const BubbleText = styled.Text`
  color: ${({theme}) => theme.color.white ?? 'white'};
  font-size: 24px;
  font-weight: bold;
  line-height: 36px;
  text-align: left;
  font-family: ${({theme}) => theme.font.regular};
`;
