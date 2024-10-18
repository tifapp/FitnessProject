import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type AvatarRef = {
  pulse: () => void;
  standUp: () => void;
};

export const ITEM_SIZE = 125;

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

export const Avatar = forwardRef<AvatarRef, Item>(({
  color,
  rotation,
  opacity,
}: Item, ref) => {
  // Shared values for animations
  const iconRotation = useSharedValue(rotation);
  const pulse = useSharedValue(0);
  const standUpRotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Animated styles for the icon
  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  const animatedIconStyle = useAnimatedStyle(() => {
    const animatedColor = interpolateColor(
      pulse.value,
      [0, 1],
      ['black', color] // Adjust 'black' to your desired base color if needed
    );

    return {
      transform: [
        { rotate: `${iconRotation.value + standUpRotation.value}deg` }, // Apply rotation
        { translateY: translateY.value }, // Apply vertical translation (jump)
      ],
      color: animatedColor,
      opacity: opacity ?? 1,
    };
  });

  // Expose the pulse and standUp methods to parent components
  useImperativeHandle(ref, () => ({
    pulse: () => {
      // Pulse Color Animation (CPR-like compression and release)
      pulse.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }), // Slower pulse to 'color'
        withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) })  // Return to 'black' gently
      );
    },
    standUp: () => {
      // Stand-Up Rotation Animation
      standUpRotation.value = withSequence(
        withTiming(15, { duration: 300, easing: Easing.out(Easing.ease) }), // Tilt forward to 15 degrees
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }),   // Return to original position
        withTiming(-rotation, { duration: 600, easing: Easing.out(Easing.cubic) }),   // Translate upwards to simulate the "jump"
      );
    
      translateY.value = withSequence(
        withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }), // Move up (jump)
        withTiming(-80, { duration: 800, easing: Easing.out(Easing.quad) }), // Move up (jump)
        withTiming(-20, { duration: 200, easing: Easing.out(Easing.quad) })    // Fall back down
      );

      // Apply color transition at the same time as standing up
      pulse.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }), // Tilt forward to 15 degrees
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }), // Tilt forward to 15 degrees
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
    }
  }));

  return (
    <Animated.View style={styles.optionContainer}>
      {/* Person Icon */}
      <AnimatedIcon name="accessibility" style={animatedIconStyle} size={120} />
    </Animated.View>
  );
});

Avatar.displayName = 'Avatar'; // Optional: Helps with debugging

const styles = StyleSheet.create({
  optionContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
    backgroundColor: 'transparent',
  },
});
