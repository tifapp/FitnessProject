import { StackScreenProps } from "@react-navigation/stack";
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from "react";
import { StackNavigatorType } from "../../../components/Navigation";
import { EnterGoalScene } from "../EnterGoal/Scene";
import { EnterMotivationScene } from "../EnterMotivation/Scene";
import { NarrationScene } from "../Narration/Scene";

// Define the type for navigation params
export type ParamsList = {
  Scene1: undefined;  // No params for Scene1
  Scene2: undefined;  // No params for Scene2
  Scene3: undefined;  // No params for Scene3
};

async function playSound() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/music.mp3') // Path to your audio file
  );
  await sound.setIsLoopingAsync(true); // Set the sound to loop
  await sound.playAsync();
  return sound;
}

export const Screens = <Params extends ParamsList>(
  stack: StackNavigatorType<Params>
) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const fadeInIntervalRef = useRef<number | null>(null); // Use ref to track fadeIn interval
  const fadeOutIntervalRef = useRef<number | null>(null); // Use ref to track fadeOut interval

  useEffect(() => {
    playSound().then((newSound) => {
      setSound(newSound);
    });

    return () => {
      sound?.unloadAsync();
    };
  }, []); // Dependency on sound

  const clearFadeIn = () => {
    if (fadeInIntervalRef.current !== null) {
      clearInterval(fadeInIntervalRef.current);
      fadeInIntervalRef.current = null; // Reset after clearing
    }
  };

  const clearFadeOut = () => {
    if (fadeOutIntervalRef.current !== null) {
      clearInterval(fadeOutIntervalRef.current);
      fadeOutIntervalRef.current = null; // Reset after clearing
    }
  };

  // Function to adjust volume
  const setVolume = async (volume: number) => {
    if (sound) {
      await sound.setVolumeAsync(volume);
    }
  };

  // Fade-in function
  const fadeIn = async (duration: number = 1000) => {
    if (!sound) return;

    let volume = 0;
    const interval = 100; // adjust volume every 100ms
    const step = interval / duration; // the amount to increase each interval

    clearFadeOut(); // Stop fading out and clear the interval
    fadeInIntervalRef.current = setInterval(() => {
      if (volume < 1) {
        volume += step;
        setVolume(Math.min(volume, 1)); // Ensure volume doesn't go over 1
      } else {
        clearFadeIn(); // Stop fading in and clear the interval
      }
    }, interval) as unknown as number; // Typescript fix for setInterval return type
  };

  // Fade-out function
  const fadeOut = async (duration: number = 1000) => {
    if (!sound) return;

    let volume = 1;
    const interval = 100; // adjust volume every 100ms
    const step = interval / duration; // the amount to decrease each interval

    clearFadeIn(); // Stop fading out and clear the interval
    fadeOutIntervalRef.current = setInterval(() => {
      if (volume > 0) {
        volume -= step;
        setVolume(Math.max(volume, 0)); // Ensure volume doesn't go below 0
      } else {
        clearFadeOut(); // Stop fading out and clear the interval
      }
    }, interval) as unknown as number; // Typescript fix for setInterval return type
  };
  
  const goal = useRef<string>()
  const color = useRef<string>()

  return (
    <>
      <stack.Screen
        name="Scene3"
        options={() => ({
          title: "",
        })}
      >
        {(props: StackScreenProps<Params, 'Scene3'>) => (
          <EnterGoalScene 
            onComplete={([value, value2]) => {
              clearFadeIn();
              clearFadeOut();
              color.current = value;
              goal.current = value2;
              props.navigation.navigate("Scene2");
            }}
            onStart={() => {clearFadeIn(); fadeOut(8000);}}
            onEnd={() => {clearFadeOut(); fadeIn();}}
            {...props}
          />
        )}
      </stack.Screen>
      <stack.Screen
        name="Scene2"
        options={() => ({
          title: "",
        })}
      >
        {(props: StackScreenProps<Params, 'Scene2'>) => (
          <EnterMotivationScene 
            color={color.current}
            goal={goal.current}
            onStand={() => {
              fadeIn();
            }}
            onComplete={() => {
              props.navigation.navigate("Scene1");
            }}
            {...props}
          />
        )}
      </stack.Screen>
      <stack.Screen
        name="Scene1"
        options={() => ({
          title: "",
        })}
      >
        {(props: StackScreenProps<Params, 'Scene1'>) => (
          <NarrationScene
            goal={goal.current}
            color={color.current}
            onComplete={() => {}}
            {...props}
          />
        )}
      </stack.Screen>
    </>
  );
};
