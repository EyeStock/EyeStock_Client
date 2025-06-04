import React, {useEffect, useState} from 'react';
import Voice from '@react-native-voice/voice';
import styled from 'styled-components/native';

interface VoiceInputProps {
  onResult: (text: string) => void;
}

export default function VoiceInput({onResult}: VoiceInputProps) {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    try {
      setRecognizedText('');
      setIsListening(true);
      await Voice.start('ko-KR');
    } catch (e) {
      console.error('[Voice Start Error]', e);
    }
  };

  useEffect(() => {
    Voice.onSpeechResults = event => {
      const text = event.value?.[0];
      if (text) {
        onResult(text);
        setRecognizedText(text);
        setIsListening(false);
      }
    };

    Voice.onSpeechError = event => {
      console.error('[Speech Error]', event);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <Container onPress={startListening}>
      <Title>말해주세요.</Title>

      <Bubble>
        <RecognizedText>{recognizedText || '...'}</RecognizedText>
      </Bubble>

      <Footer>다시 말하고 싶으면 탭</Footer>
    </Container>
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
  margin-bottom: 24px;
  color: ${({theme}) => theme.color.black};
  font-family: ${({theme}) => theme.font.regular};
`;

const Bubble = styled.View`
  background-color: ${({theme}) => theme.color.primary};
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 48px;
  width: 80%;
`;

const RecognizedText = styled.Text`
  color: ${({theme}) => theme.color.white};
  font-size: 22px;
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
