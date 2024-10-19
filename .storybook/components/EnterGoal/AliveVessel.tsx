// Doll.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../../modules/tif-haptics';
import { PROGRESS_DURATION } from './PickerItem';

// Define the size and durations
export const ITEM_SIZE = 125;
const HEARTBEAT_INTERVAL = 2000;

// Define the props for the Doll component
export type DollProps = {
  color: string;
  rotation: number;
  opacity?: number;
  isPressed?: boolean;
  triggerFall?: boolean; // New prop to trigger the fall animation
};

export interface DollRef {
  handleGestureStart: () => void;
  handleGestureEnd: () => void;
}

export const Doll = ({
  color,
  rotation,
  opacity,
  isPressed,
  triggerFall = false, // Default to false
}: DollProps) => {
  const [dummy, setDummy] = useState(false);
  const haptics = useHaptics();

  // Shared values for animations
  const pulse = useSharedValue(0);
  const progress = useSharedValue(0);
  const iconRotation = useSharedValue(rotation);

  // Shared values for lively jumping animation
  const jumpingTranslateY = useSharedValue(0);
  const jumpingScale = useSharedValue(1);
  const jumpingRotate = useSharedValue(0);

  // Shared values for fall animation
  const fallTranslateX = useSharedValue(0);
  const fallTranslateY = useSharedValue(0);
  const fallRotation = useSharedValue(0);
  const fallColor = useSharedValue(0); // 0: original color, 1: black

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
    const jumpDurationUp = 550 + Math.random() * 200; // Between 550ms and 750ms
    const jumpDurationDown = 550 + Math.random() * 200; // Between 550ms and 750ms
    const scaleUp = 1 + Math.random() * 0.2; // Between 1 and 1.2
    const rotateMax = 10 + Math.random() * 10; // Between 10deg and 20deg
    const phaseOffset = Math.random() * 1000; // Between 0ms and 1000ms
    return { jumpHeight, jumpDurationUp, jumpDurationDown, scaleUp, rotateMax, phaseOffset };
  }, []);

  // Handle haptic feedback
  const triggerHapticBurst = () => {
    haptics.playHeartbeat();
  };

  // Animated styles for the icon
  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  const animatedIconStyle = useAnimatedStyle(() => {

    return {
      transform: [
        { rotate: `${jumpingRotate.value}deg` }, // Combine jumping and fall rotation
        { scale: jumpingScale.value },
        { translateY: jumpingTranslateY.value + fallTranslateY.value }, // Combine jumping and fall translateY
        { translateX: fallTranslateX.value }, // Fall translateX
      ],
      opacity: opacity ?? 1,
    };
  });
  
  const fallAnimatedIconStyle = useAnimatedStyle(() => {
    // Interpolate pulse for color change (heartbeat effect)
    const pulseColor = interpolateColor(pulse.value, [0, 1], [color, 'black']);

    // Interpolate fallColor to transition to black
    const finalColor = interpolateColor(
      fallColor.value,
      [0, 1],
      [pulseColor, 'black']
    );

    return {
      transform: [
        { rotate: `${fallRotation.value}deg` }, // Combine jumping and fall rotation
      ],
      color: finalColor,
    };
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const startTime = Date.now();

    const playHeartbeat = () => {
      if (!isMounted || !isPressed) return;

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

    if (isPressed && dummy && !triggerFall) {
      playHeartbeat();

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
          if (isFinished && isPressed) {
            runOnJS(triggerHapticBurst)();

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

            progress.value = 0;
            pulse.value = 0;
          }
        }
      );
      console.log('Heartbeat and Progress Started');
    } else {
      progress.value = withTiming(0, { duration: 300 });

      // Reset pulse
      pulse.value = withTiming(0, { duration: 300 });

      // Resume the jumping animation
      startJumping();

      console.log('Jumping Animation Resumed');
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPressed, dummy, haptics, triggerFall]);

  useEffect(() => {
    setTimeout(() => setDummy(true), 100);
  }, []);

  // Function to start the jumping animation with random parameters
  const startJumping = () => {
    // Reset to initial values before starting the animation
    jumpingTranslateY.value = 0;
    jumpingScale.value = 1;
    jumpingRotate.value = 0;

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
          duration: jumpDurationUp / 2,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(-rotateMax, { // Rotate to the left
          duration: jumpDurationDown,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, { // Reset rotation
          duration: jumpDurationUp / 2,
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

  // useEffect to handle fall animation when triggerFall becomes true
  useEffect(() => {
    if (triggerFall) {
      // Stop existing animations
      stopJumping();
      pulse.value = withTiming(0, { duration: 300 });
      progress.value = withTiming(0, { duration: 300 });

      // Get window dimensions
      const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

      // Define horizontal velocity, randomly to left or right
      const horizontalVelocity = -100;

      // Animate translateX to horizontalVelocity over duration
      fallTranslateX.value = withTiming(horizontalVelocity, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      // Animate translateY to windowHeight + ITEM_SIZE over duration
      fallTranslateY.value = withTiming(windowHeight + ITEM_SIZE, {
        duration: 1000,
        easing: Easing.quad,
      });

      // Animate rotation for spin (e.g., 720 degrees)
      fallRotation.value = withTiming(-80, {
        duration: 1000,
        easing: Easing.linear,
      });

      // Animate color to black
      fallColor.value = withTiming(1, {
        duration: 300,
        easing: Easing.linear,
      });

      // Optionally, you can add a callback after animation completes
      // For example, to notify parent or to perform cleanup
      // Here, we'll log to console
      runOnJS(() => {
        console.log('Fall Animation Triggered');
      })();
    }
  }, [triggerFall]);

  return (
    <Animated.View style={styles.optionContainer}>
      <Animated.View style={animatedIconStyle}>
        <AnimatedIcon name="accessibility" style={fallAnimatedIconStyle} size={90} />
        </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    backgroundColor: 'transparent',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
});
