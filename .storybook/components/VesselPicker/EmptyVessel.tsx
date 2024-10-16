// PickerItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../../modules/tif-haptics';
import { createHeartbeatPattern } from './Haptics';
import { HeartProgress } from "./Meter";

export const ITEM_SIZE = 125;
const HEARTBEAT_INTERVAL = 2000;
const PROGRESS_DURATION = 10000;

export type Item = {
  color: string;
  rotation: number;
  onSelect?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  opacity?: number;
};

export const Doll = ({
  color,
  rotation,
  onSelect = () => {},
  onPress = () => {},
  onLongPress= () => {},
  onPressOut= () => {},
  opacity,
  onGestureStart= () => {},
  onGestureEnd= () => {},  
}: Item) => {
  const haptics = useHaptics();

  // Shared values for animations
  const pulse = useSharedValue(0);
  const progress = useSharedValue(0);
  const iconRotation = useSharedValue(rotation);
  const isPressed = useSharedValue(false);

  // Additional shared values for bouncy jump animation
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Handle haptic feedback
  const triggerHapticBurst = () => {
    haptics.playCustomPattern(createHeartbeatPattern());
  };

  // Animated styles for the icon
  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  const animatedIconStyle = useAnimatedStyle(() => {
    const animatedColor = interpolateColor(
      pulse.value,
      [0, 1],
      ['black', color]
    );

    return {
      transform: [
        { rotate: `${iconRotation.value}deg` },
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      color: animatedColor,
      opacity: opacity ?? 1,
    };
  });

  // Gesture handling using LongPress
  const gesture = Gesture.LongPress()
    .minDuration(100) // Slight delay before recognizing press
    .maxDistance(20) // Allow slight finger movements
    .shouldCancelWhenOutside(false) // Prevent cancellation on movement outside
    .onStart(() => {
      isPressed.value = true;
      runOnJS(onPress)();

      // Notify parent that gesture has started
      if (onGestureStart) {
        runOnJS(onGestureStart)();
      }

      // Start progress meter animation
      progress.value = withTiming(
        1,
        {
          duration: PROGRESS_DURATION,
          easing: Easing.linear,
        },
        (isFinished) => {
          if (isFinished && isPressed.value) {
            runOnJS(triggerHapticBurst)();
            runOnJS(onLongPress)();

            // Perform a bouncy jump (scale and translateY)
            scale.value = withSequence(
              withSpring(1.3, { damping: 5, stiffness: 100 }),
              withSpring(1, { damping: 5, stiffness: 100 })
            );
            translateY.value = withSequence(
              withSpring(-20, { damping: 5, stiffness: 100 }),
              withSpring(0, { damping: 5, stiffness: 100 })
            );

            // Reset rotation to upright position
            iconRotation.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            });

            if (progress.value === 1) {
              runOnJS(onSelect)();
            }

            // Reset states
            isPressed.value = false;
            progress.value = 0;
            pulse.value = 0;
            runOnJS(onPressOut)();

            // Notify parent that gesture has ended
            if (onGestureEnd) {
              runOnJS(onGestureEnd)();
            }
          }
        }
      );
    })
    .onFinalize(() => {
      if (isPressed.value) {
        // If the press is released before completion
        isPressed.value = false;
        progress.value = withTiming(0, { duration: 300 });
        runOnJS(onPressOut)();

        // Reset pulse
        pulse.value = withTiming(0, { duration: 300 });

        // Notify parent that gesture has ended
        if (onGestureEnd) {
          runOnJS(onGestureEnd)();
        }
      }
    });

  // React state to track 'pressed' for haptic heartbeat
  const [pressed, setPressed] = useState(false);

  // Sync shared value 'isPressed' with React state 'pressed'
  useDerivedValue(() => {
    runOnJS(setPressed)(isPressed.value);
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const startTime = Date.now();

    const playHeartbeat = () => {
      if (!isMounted || !pressed) return;

      // Calculate elapsed time
      const elapsedTime = Date.now() - startTime;

      // Decrease interval duration over time
      const newInterval = Math.max(HEARTBEAT_INTERVAL - elapsedTime / 5, 200);

      // Play haptic feedback
      triggerHapticBurst();

      // Trigger pulse animation (synchronized with haptic)
      pulse.value = withSequence(
        withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        })
      );

      // Schedule next heartbeat
      timeoutId = setTimeout(playHeartbeat, newInterval);
    };

    if (pressed) {
      playHeartbeat();
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pressed, haptics]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={styles.optionContainer}>
        {/* Heart Progress Meter */}
        <View style={styles.heartContainer}>
          <HeartProgress progress={progress} size={80} color={color} />
        </View>

        {/* Person Icon */}
        <AnimatedIcon name="accessibility" style={animatedIconStyle} size={90} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 5,
  },
  heartContainer: {
    position: 'absolute',
    top: -ITEM_SIZE/2, // Position the heart above the icon
    alignItems: 'center',
    justifyContent: 'center',
  },
});
