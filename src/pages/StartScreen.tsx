import React, {useEffect} from 'react';
import {Alert, Image} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootStackParamList';
import {useBiometricAuth} from '../hooks/useBiometricAuth';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'StartScreen'>;

export default function StartScreen() {
  const navigation = useNavigation<Navigation>();
  const {login} = useBiometricAuth();

  useEffect(() => {
    const doBiometricLogin = async () => {
      try {
        await login();
        navigation.navigate('TalkStartScreen');
      } catch (err: any) {
        Alert.alert(
          '지문 인증 실패',
          err?.message || '지문 인증에 실패했습니다.',
        );
      }
    };

    doBiometricLogin();
  }, []);

  return (
    <FullTouchable activeOpacity={1}>
      <Container>
        <Inner>
          <StyledImage
            source={require('../assets/logo.png')}
            resizeMode="contain"
          />
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
  background-color: ${({theme}) => theme.color.white};
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
  color: ${({theme}) => theme.color.black};
  font-size: 24px;
  font-family: ${({theme}) => theme.font.regular};
  font-weight: bold;
  margin-bottom: 24px;
`;
