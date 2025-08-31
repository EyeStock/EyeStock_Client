import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Modal, View, Text, Alert} from 'react-native';
import styled from 'styled-components/native';
import Tts from 'react-native-tts';
import TtsArea from '../components/TtsArea';
import {useVoiceInput} from '../hooks/useVoiceInput';

type Props = {
  visible: boolean;
  onComplete: (answers: {
    investmentStyle: string;
    favoriteCompanies: string;
  }) => void;
  onCancel: () => void;
};

const STEP_1_TTS =
  '처음 만나서 반가워요! 투자 방식을 말씀해 주세요. 예를 들면, 공격형, 적극투자형, 안정형 등이 있어요.';
const STEP_2_TTS =
  '좋아요. 이제 관심 있는 기업을 말씀해 주세요. 예를 들면, 삼성전자, 네이버, 테슬라 등입니다.';

export default function PreferenceModal({
  visible,
  onComplete,
  onCancel,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [investmentStyle, setInvestmentStyle] = useState('');
  const [favoriteCompanies, setFavoriteCompanies] = useState('');

  const {
    isListening,
    recognizedText,
    startListening,
    stopListening,
    resetText,
  } = useVoiceInput({
    language: 'ko-KR',
    onResultText: text => {
      if (step === 1) setInvestmentStyle(text);
      else setFavoriteCompanies(text);
    },
  });

  // 단계 변경될 때마다 안내 음성
  useEffect(() => {
    if (!visible) return;
    const text = step === 1 ? STEP_1_TTS : STEP_2_TTS;
    Tts.stop();
    Tts.setDefaultLanguage?.('ko-KR');
    Tts.speak(text);
    // 단계 변경 시 이전 인식 텍스트 초기화
    resetText();
  }, [visible, step, resetText]);

  const canNext = useMemo(() => {
    return step === 1
      ? investmentStyle.trim().length > 0
      : favoriteCompanies.trim().length > 0;
  }, [step, investmentStyle, favoriteCompanies]);

  const handleNext = () => {
    if (!canNext) {
      Alert.alert(
        '입력 필요',
        '음성으로 답변을 인식한 후 다음으로 진행해주세요.',
      );
      return;
    }
    if (step === 1) setStep(2);
    else {
      onComplete({
        investmentStyle: investmentStyle.trim(),
        favoriteCompanies: favoriteCompanies.trim(),
      });
    }
  };

  const handleListenToggle = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const prompt =
    step === 1 ? '투자 방식을 말씀해 주세요' : '관심 있는 기업을 말씀해 주세요';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Dim>
        <Sheet>
          <Header>
            <HeaderTitle>취향 설정</HeaderTitle>
            <CloseBtn onPress={onCancel}>
              <CloseText>건너뛰기</CloseText>
            </CloseBtn>
          </Header>

          <TtsArea ttsText="">
            {step === 1
              ? '투자방식을 입력해주세요'
              : '관심 기업을 입력해주세요'}
          </TtsArea>

          <Question>{prompt}</Question>

          <InputBox>
            <AnswerText numberOfLines={2}>
              {step === 1
                ? investmentStyle || '...'
                : favoriteCompanies || '...'}
            </AnswerText>
          </InputBox>

          <Row>
            <MicBtn onPress={handleListenToggle}>
              <MicBtnText>
                {isListening ? '인식 중지' : '음성 인식 시작'}
              </MicBtnText>
            </MicBtn>

            <ClearBtn
              onPress={() => {
                if (step === 1) setInvestmentStyle('');
                else setFavoriteCompanies('');
                resetText();
              }}>
              <ClearBtnText>초기화</ClearBtnText>
            </ClearBtn>
          </Row>

          <PrimaryBtn onPress={handleNext} disabled={!canNext}>
            <PrimaryBtnText>{step === 1 ? '다음' : '완료'}</PrimaryBtnText>
          </PrimaryBtn>
        </Sheet>
      </Dim>
    </Modal>
  );
}

const Dim = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 24px;
  justify-content: center;
  align-items: center;
`;

const Sheet = styled.View`
  width: 100%;
  max-width: 520px;
  background-color: ${({theme}) => theme.color.white ?? 'white'};
  border-radius: 16px;
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({theme}) => theme.color.black ?? 'black'};
`;

const CloseBtn = styled.Pressable``;

const CloseText = styled.Text`
  color: #666;
`;

const Question = styled.Text`
  margin: 8px 0 12px;
  font-size: 16px;
  color: ${({theme}) => theme.color.black ?? 'black'};
`;

const InputBox = styled.View`
  min-height: 72px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  background: #f9fafb;
`;

const AnswerText = styled.Text`
  font-size: 16px;
  color: ${({theme}) => theme.color.black ?? 'black'};
`;

const Row = styled.View`
  flex-direction: row;
  gap: 12px;
  margin: 16px 0 8px;
`;

const MicBtn = styled.Pressable`
  flex: 1;
  background: ${({theme}) => theme.color.black ?? 'black'};
  padding: 14px;
  border-radius: 12px;
  align-items: center;
`;

const MicBtnText = styled.Text`
  color: ${({theme}) => theme.color.white ?? 'white'};
  font-weight: 700;
`;

const ClearBtn = styled.Pressable`
  width: 100px;
  background: #e5e7eb;
  padding: 14px;
  border-radius: 12px;
  align-items: center;
`;

const ClearBtnText = styled.Text`
  color: ${({theme}) => theme.color.black ?? 'black'};
  font-weight: 700;
`;

const PrimaryBtn = styled.Pressable<{disabled?: boolean}>`
  background: ${({theme, disabled}) =>
    disabled ? '#d1d5db' : theme.color.black ?? 'black'};
  padding: 16px;
  border-radius: 14px;
  align-items: center;
  margin-top: 8px;
`;

const PrimaryBtnText = styled.Text`
  color: ${({theme}) => theme.color.white ?? 'white'};
  font-weight: 700;
`;
