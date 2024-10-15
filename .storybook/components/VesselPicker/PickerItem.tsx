// PickerItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../../modules/tif-haptics';
import { createHeartbeatPattern } from './Haptics';

export const ITEM_SIZE = 125;

export type Item = {
  color: string;
  rotation: number;
  onPress: () => void;
  onLongPress: () => void;
  onPressOut: () => void;
  opacity?: number;
};

export const PickerItem = ({
  color,
  rotation,
  onPress,
  onLongPress,
  onPressOut,
  opacity,
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

  // Duration for the progress meter to fill up (e.g., 5 seconds)
  const PROGRESS_DURATION = 5000;

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

  // Animated styles for the progress meter
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  // Gesture handling using LongPress
  const gesture = Gesture.LongPress()
    .minDuration(0) // Detect press immediately
    .onStart(() => {
      isPressed.value = true;
      runOnJS(onPress)();
      
      // Start pulsing animation (black <-> color)
      pulse.value = withRepeat(
        withTiming(1, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // Infinite repetitions
        true // Reverse each cycle
      );

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

            // Reset states
            isPressed.value = false;
            progress.value = 0;
            pulse.value = 0;
            runOnJS(onPressOut)();
          }
        }
      );
    })
    .onFinalize(() => {
      if (isPressed.value) {
        // If the press is released before completion
        isPressed.value = false;
        pulse.value = withTiming(0, { duration: 300 });
        progress.value = withTiming(0, { duration: 300 });
        runOnJS(onPressOut)();
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
      const newInterval = Math.max(3000 - elapsedTime / 5, 200);

      // Play haptic feedback
      const pattern = createHeartbeatPattern();
      triggerHapticBurst();

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
        <AnimatedIcon name="accessibility" style={animatedIconStyle} size={90} />
        <Animated.View style={[styles.progressBar, { backgroundColor: color }, animatedProgressStyle]} />
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
});
