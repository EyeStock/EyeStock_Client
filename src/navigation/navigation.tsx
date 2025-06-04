import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import StartScreen from '../pages/StartScreen';
import TalkStartScreen from '../pages/TalkStartScreen';
import SpeechToTextScreen from '../pages/SpeechToTextScreen';
import {RootStackParamList} from './RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="StartScreen"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="StartScreen" component={StartScreen} />
        <Stack.Screen name="TalkStartScreen" component={TalkStartScreen} />
        <Stack.Screen
          name="SpeechToTextScreen"
          component={SpeechToTextScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
