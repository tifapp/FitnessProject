import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackCardStyleInterpolator } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Easing } from 'react-native';
import { Screens } from "../../components/Game/Stack";

const Stack = createStackNavigator<any>();

const forFade: StackCardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

async function playSound() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/music.mp3') // Path to your audio file
  );
  await sound.playAsync();
  return sound;
}

export const Navigation = () => {
  const [sound, setSound] = useState<any>();

  useEffect(() => {
    playSound().then(sound => 
      setSound(sound)
    )
  }, [])

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Unload the sound when the component unmounts
        }
      : undefined;
  }, [sound]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          cardStyle: {backgroundColor: "white"},
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
