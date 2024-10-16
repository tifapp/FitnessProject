
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
  withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../../modules/tif-haptics';
import { createHeartbeatPattern } from '../VesselPicker/Haptics';

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

  // Shared values for lively jumping animation
  const jumpingTranslateY = useSharedValue(0);
  const jumpingScale = useSharedValue(1);
  const jumpingRotate = useSharedValue(0);

  // Randomized animation parameters using useMemo to ensure they are set once
  const {
    jumpHeight,
    jumpDurationUp,
    jumpDurationDown,
    scaleUp,
    rotateMax,
    phaseOffset,
  } = useMemo(() => {
    const jumpHeight = -50 + Math.random() * -20; // Between -50 and -70
    const jumpDurationUp = 500 + Math.random() * 200; // Between 500ms and 700ms
    const jumpDurationDown = 500 + Math.random() * 200; // Between 500ms and 700ms
    const scaleUp = 1 + Math.random() * 0.2; // Between 1 and 1.2
    const rotateMax = 10 + Math.random() * 10; // Between 10deg and 20deg
    const phaseOffset = Math.random() * 1000; // Between 0ms and 1000ms
    return { jumpHeight, jumpDurationUp, jumpDurationDown, scaleUp, rotateMax, phaseOffset };
  }, []);

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
      [color, 'black']
    );

    return {
      transform: [
        { rotate: `${jumpingRotate.value}deg` },
        { scale: jumpingScale.value },
        { translateY: jumpingTranslateY.value },
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

      // Stop the jumping animation
      stopJumping();

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

            // Resume the jumping animation
            if (!isPressed.value) {
              startJumping();
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

        // Resume the jumping animation
        startJumping();
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

  // Function to start the jumping animation with random parameters
  const startJumping = () => {
    // Jumping TranslateY: Jump high up and come down with randomized parameters
    jumpingTranslateY.value = withRepeat(
      withSequence(
        withTiming(jumpHeight, { // Randomized jump height
          duration: jumpDurationUp,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0, { // Come back down
          duration: jumpDurationDown,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1, // Infinite repetitions
      true // yoyo effect to repeat the sequence
    );

    // Randomized Scale Animation
    jumpingScale.value = withRepeat(
      withSequence(
        withTiming(scaleUp, { // Randomized scale up
          duration: jumpDurationUp,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, { // Scale back to normal
          duration: jumpDurationDown,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1,
      true
    );

    // Randomized Rotation Animation
    jumpingRotate.value = withRepeat(
      withSequence(
        withTiming(rotateMax, { // Randomized rotate to the right
          duration: jumpDurationUp / 3,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(-rotateMax, { // Rotate to the left
          duration: jumpDurationDown,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, { // Reset rotation
          duration: jumpDurationUp / 3,
          easing: Easing.in(Easing.quad),
        })
      ),
      -1,
      false // Do not loop rotation continuously
    );
  };

  // Function to stop the jumping animation
  const stopJumping = () => {
    jumpingTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    jumpingScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    jumpingRotate.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
  };

  // Start the jumping animation when component mounts with a phase offset for randomness
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPressed.value) {
        startJumping();
      }
    }, phaseOffset); // Apply phase offset

    return () => {
      clearTimeout(timer);
      // Clean up animations when component unmounts
      jumpingTranslateY.value = 0;
      jumpingScale.value = 1;
      jumpingRotate.value = 0;
    };
  }, [phaseOffset]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={styles.optionContainer}>
        <AnimatedIcon name="accessibility" style={animatedIconStyle} size={90} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    backgroundColor: "transparent",
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 5,
  },
  heartContainer: {
    position: 'absolute',
    top: -ITEM_SIZE / 2, // Position the heart above the icon
    alignItems: 'center',
    justifyContent: 'center',
  },
});