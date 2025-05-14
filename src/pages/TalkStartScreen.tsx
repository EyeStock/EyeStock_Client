import React from "react";
import { ImageSourcePropType } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styled from "styled-components/native";

export default function TalkStartScreen() {
  const navigation = useNavigation();

  return (
    <Container>
      <CenterBox>
        <Logo
          source={require('../assets/logo.png') as ImageSourcePropType}
          resizeMode="contain"
        />
        <Title>EYESTOCK</Title>
        <Subtitle>EYESTOCK와 대화해요.</Subtitle>
      </CenterBox>

      <SpeechBubble>
        <BubbleTail />
        <BubbleText>
          안녕하세요.{"\n"}
          EYESTOCK입니다.{"\n"}
          저는 금융 데이터 정보,{"\n"}
          감성 대화, 맞춤형 투자 전략{"\n"}
          제공이 가능합니다.
        </BubbleText>
      </SpeechBubble>

      <StartButton onPress={() => {}}>
        <StartButtonText>대화를 시작하고자 하면 탭</StartButtonText>
      </StartButton>
    </Container>
  );
}
const Container = styled.View`
  flex: 1;
  background-color: white;
  justify-content: space-between;
`;

const CenterBox = styled.View`
  align-items: center;
  margin-top: 80px;
`;

const Logo = styled.Image`
  width: 64px;
  height: 64px;
`;

const Title = styled.Text`
  color: black;
  font-size: 20px;
  font-weight: bold;
  margin-top: 12px;
`;

const Subtitle = styled.Text`
  color: black;
  font-size: 18px;
  margin-top: 8px;
`;

const SpeechBubble = styled.View`
  background-color: black;
  padding: 20px 24px;
  margin: 0 20px;
  border-radius: 24px;
  position: relative;
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
  border-top-color: black;
`;

const BubbleText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 28px;
`;

const StartButton = styled.TouchableOpacity`
  background-color: #7c3aed;
  padding: 20px;
  align-items: center;
`;

const StartButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;
