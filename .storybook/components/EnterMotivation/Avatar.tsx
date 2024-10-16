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
import { useHaptics } from '../../../modules/tif-haptics';

export type AvatarRef = {
  wiggle: () => void;
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
  const haptics = useHaptics();

  // Shared values for animations
  const iconRotation = useSharedValue(rotation);
  const wiggleRotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const standUpRotation = useSharedValue(0);

  // Constants for translation
  const HALF_HEIGHT = ITEM_SIZE / 2;

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
        { translateY: -HALF_HEIGHT }, // Move up to set pivot
        { rotate: `${iconRotation.value + wiggleRotation.value + standUpRotation.value}deg` }, // Apply rotation
        { translateY: -HALF_HEIGHT }, // Move back down to original position
      ],
      color: animatedColor,
      opacity: opacity ?? 1,
    };
  });

  // Expose the wiggle and standUp methods to parent components
  useImperativeHandle(ref, () => ({
    wiggle: () => {
      // Wiggle Rotation Animation
      wiggleRotation.value = withSequence(
        withTiming(-5, { duration: 100, easing: Easing.out(Easing.ease) }), // Reduced angle
        withTiming(5, { duration: 200, easing: Easing.out(Easing.ease) }),  // Reduced angle
        withTiming(0, { duration: 100, easing: Easing.out(Easing.ease) })
      );

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
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })   // Return to original position
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
