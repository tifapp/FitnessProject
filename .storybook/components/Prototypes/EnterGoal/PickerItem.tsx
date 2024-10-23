import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Subtitle } from "../../../../components/Text";
import { Cloud } from "../Icons/Cloud";
import { Doll } from './AliveVessel';
import { HeartProgress } from "./Meter";

export const ITEM_SIZE = 125;
export const PROGRESS_DURATION = 10000;

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
  const progress = useSharedValue(0);

  const handleGestureStart = disabled ? () => {} : () => {
    setIsPressed(true);
    onProgressStart();
    progress.value = withTiming(1, { duration: PROGRESS_DURATION }, (isFinished) => {
      if (isFinished) {
        runOnJS(onProgressComplete)();
        runOnJS(setIsPressed)(false);
        runOnJS(setIsFall)(true);
      }
    });
  };

  const handleGestureEnd =disabled ? () => {} : () => {
    onEnd();
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progress.value = withTiming(0, { duration: 100 });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const gesture = Gesture.LongPress()
    .minDuration(100)
    .maxDistance(100)
    .onStart(() => {
      runOnJS(handleGestureStart)();
    })
    .onEnd(() => {
      runOnJS(handleGestureEnd)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Cloud style={{ width: ITEM_SIZE + 120, height: ITEM_SIZE + 120 }} />
        <HeartProgress progress={progress} size={80} color={color} />
        <Doll
          isPressed={isPressed}
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
