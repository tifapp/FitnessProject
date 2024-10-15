import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackCardStyleInterpolator } from '@react-navigation/stack';
import React from 'react';
import { Easing } from 'react-native';
import { Screens } from "../../components/Game/Stack";

const Stack = createStackNavigator<any>();

const forFade: StackCardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          cardStyleInterpolator: forFade,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              },
            },
          },
          headerShown: false,
        }}
        initialRouteName="Scene1"
      >
        {Screens(Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
