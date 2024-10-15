import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { StackNavigatorType } from "../../../components/Navigation";
import { EnterNameScene } from "../EnterName/Scene";
import { VesselPickerScene } from "../VesselPicker/Scene";

// Define the type for navigation params
export type ParamsList = {
  Scene1: undefined;  // No params for Scene1
  Scene2: undefined;  // No params for Scene2
  Scene3: undefined;  // No params for Scene3
};

export const Screens = <Params extends ParamsList>(
  stack: StackNavigatorType<Params>
) => {
  return (
    <>
      <stack.Screen
        name="Scene1"
        options={() => ({
          title: "",
        })}
      >
        {(props: StackScreenProps<Params, 'Scene1'>) => (
          <VesselPickerScene
            onComplete={() => {
              // Navigate to Scene2 (no parameters)
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
          <EnterNameScene 
            onComplete={() => {
              props.navigation.navigate("Scene3");
            }}
            {...props}
          />
        )}
      </stack.Screen>

      <stack.Screen
        name="Scene3"
        options={() => ({
          title: "",
        })}
      >
        {(props: StackScreenProps<Params, 'Scene3'>) => (
          <EnterNameScene 
            onComplete={() => {
              props.navigation.navigate("Scene3");
            }}
            {...props}
          />
        )}
      </stack.Screen>
    </>
  );
};
