import { StackScreenProps } from "@react-navigation/stack";
import React, { useRef } from "react";
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

export const Screens = <Params extends ParamsList>(
  stack: StackNavigatorType<Params>
) => {
  const goal = useRef<string>()

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
            onComplete={(value) => {
              goal.current = value;
              props.navigation.navigate("Scene2");
            }}
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
            goal={goal.current}
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
            onComplete={() => {}}
            {...props}
          />
        )}
      </stack.Screen>
    </>
  );
};
