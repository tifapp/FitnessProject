import { StackScreenProps } from "@react-navigation/stack";
import React, { useRef } from "react";
import { ColorString } from "TiFShared/domain-models/ColorString";
import { StackNavigatorType } from "../../../../components/Navigation";
import { EnterGoalScene } from "../EnterGoal/Scene";
import { EnterMotivationScene } from "../EnterMotivation/Scene";
import { NarrationScene } from "../Narration/Scene";
import { useTrack } from "../utils/Audio";
import { useFade } from "../utils/Interpolate";

export type ParamsList = {
  Scene1: undefined;
  Scene2: undefined;
  Scene3: undefined;
};
  
export const Screens = <Params extends ParamsList>(
  stack: StackNavigatorType<Params>
) => {
  const {sound} = useTrack(require('../../assets/music.mp3'));
  const {fadeIn, fadeOut} = useFade(1, (volume) => {sound?.setVolumeAsync(volume)})
  
  const goal = useRef<string>()
  const color = useRef<ColorString>()

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
            onComplete={({color: selectedColor, persona: selectedGoal}) => {
              fadeOut();
              color.current = ColorString.parse(selectedColor)!;
              goal.current = selectedGoal;
              props.navigation.navigate("Scene2" as any);
            }}
            onStart={() => {fadeOut(8000)}}
            onEnd={() => {fadeIn()}}
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
            color={color.current!}
            goal={goal.current!}
            onStand={() => {
              sound?.setPositionAsync(254500)
              fadeIn();
            }}
            onComplete={() => {props.navigation.navigate("Scene1" as any);}}
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
            color={color.current!}
            onComplete={() => fadeOut(3000)}
            {...props}
          />
        )}
      </stack.Screen>
    </>
  );
};
