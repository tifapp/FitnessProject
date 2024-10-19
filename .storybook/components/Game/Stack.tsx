import { StackScreenProps } from "@react-navigation/stack";
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from "react";
import { StackNavigatorType } from "../../../components/Navigation";
import { useAudioFade } from "../Audio";
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
  const {clearFadeIn, clearFadeOut, fadeIn, fadeOut} = useAudioFade(sound)
  
  useEffect(() => {
    playSound().then((newSound) => {
      setSound(newSound);
    });

    return () => {
      sound?.unloadAsync();
    };
  }, []);
  
  const goal = useRef<string>("")
  const color = useRef<string>("")

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
              props.navigation.navigate("Scene2" as any);
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
              sound?.setPositionAsync(254500)
              fadeIn();
            }}
            onComplete={() => {
              props.navigation.navigate("Scene1" as any);
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
