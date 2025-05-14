import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "react-native";
import styled from "styled-components/native";
import { RootStackParamList } from "../navigation/RootStackParamList";

type Navigation = NativeStackNavigationProp<RootStackParamList, "StartScreen">;

export default function StartScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <FullTouchable onPress={() => navigation.navigate("TalkStartScreen")}>
      <Container>
        <Inner>
          <StyledImage source={require('../assets/logo.png')} resizeMode="contain" />
          <Title>EYESTOCK</Title>
        </Inner>
      </Container>
    </FullTouchable>
  );
}
const FullTouchable = styled.TouchableOpacity`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.color.white};
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
  color: ${({ theme }) => theme.color.black};
  font-size: 24px;
  font-family: ${({ theme }) => theme.font.regular};
  font-weight: bold;
  margin-bottom: 24px;
`;
