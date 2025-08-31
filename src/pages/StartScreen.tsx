import React, {useEffect, useState} from 'react';
import {Alert, Image, Platform, PermissionsAndroid} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootStackParamList';
import {useBiometricAuth} from '../hooks/useBiometricAuth';
import PreferenceModal from '../components/PreferenceModal';
import {saveUserPreferences} from '../api/saveUserPreferences';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'StartScreen'>;

export default function StartScreen() {
  const navigation = useNavigation<Navigation>();
  const {login} = useBiometricAuth();

  const [showPrefModal, setShowPrefModal] = useState(false);

  useEffect(() => {
    const doBiometricLogin = async () => {
      try {
        const res: any = await login();

        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: '마이크 권한 요청',
              message: '음성 인식을 위해 마이크 권한이 필요합니다.',
              buttonPositive: '허용',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              '권한 필요',
              '마이크 권한이 없으면 음성 입력이 불가합니다.',
            );
          }
        }

        if (res?.firstLogin) {
          setShowPrefModal(true);
        } else {
          navigation.navigate('TalkStartScreen');
        }
      } catch (err: any) {
        Alert.alert(
          '지문 인증 실패',
          err?.message || '지문 인증에 실패했습니다.',
        );
      }
    };

    doBiometricLogin();
  }, [login, navigation]);

  const handlePrefComplete = async (answers: {
    investmentStyle: string;
    favoriteCompanies: string;
  }) => {
    try {
      await saveUserPreferences({
        investmentStyle: answers.investmentStyle.trim(),
        favoriteCompanies: answers.favoriteCompanies.trim(),
      });

      navigation.navigate('TalkStartScreen');
    } catch (e: any) {
      Alert.alert(
        '저장 실패',
        e?.message ?? '취향 정보를 저장하지 못했습니다.',
      );
      navigation.navigate('TalkStartScreen');
    } finally {
      setShowPrefModal(false);
    }
  };

  const handlePrefCancel = () => {
    setShowPrefModal(false);
    navigation.navigate('TalkStartScreen');
  };

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

      <PreferenceModal
        visible={showPrefModal}
        onComplete={handlePrefComplete}
        onCancel={handlePrefCancel}
      />
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
