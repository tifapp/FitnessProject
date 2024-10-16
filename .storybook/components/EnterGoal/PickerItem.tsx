import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Subtitle } from "../../../components/Text";
import { Cloud } from "../Icons/Cloud";
import { Doll } from './AliveVessel'; // Assuming the Doll component is in the same directory

export const ITEM_SIZE = 125;
export const PROGRESS_DURATION = 10000; // You can adjust this as needed

type PickerItemProps = {
  color: string;
  persona: string;
  onProgressStart?: () => void;
  onProgressComplete?: () => void;
};

export const PickerItem = ({
  color,
  persona,
  onProgressStart = () => {},
  onProgressComplete = () => {},
}: PickerItemProps) => {
  const progress = useSharedValue(0);
  const isPressed = useSharedValue(false);

  // Gesture for long press, all state handling is now inside Reanimated blocks
  const gesture = Gesture.LongPress()
    .onStart(() => {
      isPressed.value = true;

      // Notify that the progress has started
      runOnJS(onProgressStart)();

      // Start the progress animation
      progress.value = withTiming(
        1,
        {
          duration: PROGRESS_DURATION,
          easing: Easing.linear,
        },
        (isFinished) => {
          if (isFinished && isPressed.value) {
            // Notify progress complete
            runOnJS(onProgressComplete)();

            // Reset the state
            isPressed.value = false;
            progress.value = 0;
          }
        }
      );
    })
    .onFinalize(() => {
      // Reset the press and progress when the gesture is finalized
      isPressed.value = false;
      progress.value = withTiming(0, { duration: 300 });
    });

  return (
    <GestureDetector gesture={gesture}>
      <View 
        style={{paddingTop: 150, alignItems: 'center', backgroundColor: "transparent"}}
      >
        <Cloud style={{width: ITEM_SIZE + 120, height: ITEM_SIZE + 120}} />
        <Doll color={color} rotation={0} />
        <Subtitle style={{ marginTop: 20, textAlign: 'center', backgroundColor: "transparent" }}>
          {persona}
        </Subtitle>
      </View>
    </GestureDetector>
  );
};

// Styles for PickerItem
const styles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 150,
    alignItems: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 5,
    backgroundColor: 'lightgray',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green',
  },
});
