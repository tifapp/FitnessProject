import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoryMeta } from "storybook/HelperTypes";
import { DraggableView } from "./DraggableView";
import { usePanGesture } from "./usePanGesture";

export const DraggableViewMeta: StoryMeta = {
  title: "DraggableView",
};

export default DraggableViewMeta;

export const Basic = () => {
  const draggable = usePanGesture();

  return (
    <GestureHandlerRootView>
      <View style={{ width: "100%", height: "100%", flex: 1 }}>
        <DraggableView 
          draggable={draggable}
          style={{
            position: 'absolute',
            top: "50%",
            left: "50%",
            backgroundColor: '#e0e0e0',
            padding: 20,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text>Drag me!</Text>
        </DraggableView>
      </View>
    </GestureHandlerRootView>
  )
}
