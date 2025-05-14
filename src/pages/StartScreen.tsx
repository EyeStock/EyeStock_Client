import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { RootStackParamList } from "../navigation/RootStackParamList";

type Navigation = NativeStackNavigationProp<RootStackParamList, "StartScreen">;

export default function StartScreen() {
  const navigation = useNavigation<Navigation>();
  console.log("StartScreen 렌더링됨");
  return (
    <Container>
      <Inner>
        <StyledImage source={require('../assets/logo.png')} resizeMode="contain" />
        <Title>EYESTOCK</Title>

        <StyledButton onPress={() => navigation.navigate("TalkStartScreen")}>
          <ButtonText>
            {"시작하려면\n\n버튼을 눌러주세요\n"}
          </ButtonText>
        </StyledButton>
      </Inner>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: white;
  padding: 40px 24px;
  justify-content: center;
`;

const Inner = styled.View`
  align-items: center;
`;

const StyledImage = styled.Image`
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  color: black;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const StyledButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  line-height: 44px;
`;
