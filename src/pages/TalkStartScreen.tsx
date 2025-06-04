import React, {useEffect} from 'react';
import {ImageSourcePropType, TouchableWithoutFeedback} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import Tts from 'react-native-tts';
import TtsArea from '../components/TtsArea';
import {RootStackParamList} from '../navigation/RootStackParamList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TalkStartScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    Tts.setDefaultLanguage('ko-KR');
    Tts.stop();
    Tts.speak(
      '안녕하세요. 아이스톡입니다. 저는 금융 데이터 정보, 감성 대화, 맞춤형 투자 전략 제공이 가능합니다.',
    );
  }, []);

  const handlePress = () => {
    Tts.stop();
    navigation.navigate('SpeechToTextScreen');
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Container>
        <CenterBox>
          <LogoBox>
            <Logo
              source={require('../assets/logo.png') as ImageSourcePropType}
              resizeMode="contain"
            />
            <Title>EYESTOCK</Title>
          </LogoBox>
          <Subtitle>EYESTOCK와 대화해요.</Subtitle>
        </CenterBox>

        <TtsArea ttsText="">
          안녕하세요.{'\n'}
          EYESTOCK입니다.{'\n'}
          저는 금융 데이터 정보,{'\n'}
          감성 대화, 맞춤형 투자 전략{'\n'}
          제공이 가능합니다.
        </TtsArea>

        <ScriptBox>
          <ScriptBoxText>대화를 시작하고자 하면 탭</ScriptBoxText>
        </ScriptBox>
      </Container>
    </TouchableWithoutFeedback>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.color.white};
  justify-content: space-between;
`;

const CenterBox = styled.View`
  align-items: center;
  margin-top: 80px;
`;

const LogoBox = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Logo = styled.Image`
  width: 64px;
  height: 64px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.color.black};
  font-family: ${({theme}) => theme.font.regular};
  font-size: 20px;
  font-weight: bold;
`;

const Subtitle = styled.Text`
  color: ${({theme}) => theme.color.black};
  font-family: ${({theme}) => theme.font.regular};
  font-size: 30px;
  font-weight: bold;
  margin-top: 8px;
`;

const ScriptBox = styled.View`
  background-color: ${({theme}) => theme.color.primary};
  padding: 20px;
  align-items: center;
`;

const ScriptBoxText = styled.Text`
  color: ${({theme}) => theme.color.white};
  font-family: ${({theme}) => theme.font.regular};
  font-size: 18px;
  font-weight: bold;
`;
