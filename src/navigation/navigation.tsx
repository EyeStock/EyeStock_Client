import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

export type RootStackParamList = {
    StartScreen: undefined;
    TalkStartScreen: undefined;
  };

import StartScreen from "../pages/StartScreen";
import TalkStartScreen from "../pages/TalkStartScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StartScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StartScreen" component={StartScreen} />
        <Stack.Screen name="TalkStartScreen" component={TalkStartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
