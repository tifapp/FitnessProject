// PickerItem.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Subtitle } from "../../../components/Text";
import { Cloud } from "../Icons/Cloud";
import { Doll } from './AliveVessel'; // Ensure correct import path
import { HeartProgress } from "./Meter";

export const ITEM_SIZE = 125;
export const PROGRESS_DURATION = 10000; // 10 seconds

type PickerItemProps = {
  color: string;
  persona: string;
  onEnd?: () => void;
  onProgressStart?: () => void;
  onProgressComplete?: () => void;
  disabled: boolean;
};

export const PickerItem = ({
  color,
  persona,
  onEnd = () => {},
  onProgressStart = () => {},
  onProgressComplete = () => {},
  disabled
}: PickerItemProps) => {
  const [isFall, setIsFall] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useSharedValue(0); // Shared value for progress

  // Handler to start progress
  const handleGestureStart = disabled ? () => {} : () => {
    setIsPressed(true);
    onProgressStart();
    // Animate the progress to 1 over PROGRESS_DURATION
    progress.value = withTiming(1, { duration: PROGRESS_DURATION }, (isFinished) => {
      if (isFinished) {
        runOnJS(onProgressComplete)();
        runOnJS(setIsPressed)(false); // Correctly wrapped
        runOnJS(setIsFall)(true); // Correctly wrapped
      }
    });
  };

  // Handler to cancel progress
  const handleGestureEnd =disabled ? () => {} : () => {
    onEnd();
    setIsPressed(false);
    // Clear the timer if gesture ends before PROGRESS_DURATION
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset the progress to 0
    progress.value = withTiming(0, { duration: 100 });
  };

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Define the gesture
  const gesture = Gesture.LongPress()
    .minDuration(100) // Minimum press duration to recognize the gesture
    .maxDistance(100) // Maximum movement allowed during the gesture
    .onStart(() => {
      // Update state on gesture start
      runOnJS(handleGestureStart)();
    })
    .onEnd(() => {
      // Update state on gesture end
      runOnJS(handleGestureEnd)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Cloud style={{ width: ITEM_SIZE + 120, height: ITEM_SIZE + 120 }} />
        <HeartProgress progress={progress} size={80} color={color} />
        <Doll
          isPressed={isPressed} // Pass the gesture state as prop
          color={color}
          rotation={0}
          opacity={1}
          triggerFall={isFall}
        />
        <Subtitle style={styles.subtitle}>
          {persona}
        </Subtitle>
      </View>
    </GestureDetector>
  );
};

// Styles for PickerItem
const styles = StyleSheet.create({
  container: {
    paddingTop: 150,
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  subtitle: {
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: "transparent",
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
