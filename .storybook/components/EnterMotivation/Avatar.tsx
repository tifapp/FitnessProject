import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ColorString } from 'TiFShared/domain-models/ColorString';

export type AvatarRef = {
  pulse: () => void;
  standUp: () => void;
};

export const ITEM_SIZE = 125;

export type Item = {
  color: ColorString;
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
  const iconRotation = useSharedValue(rotation);
  const pulse = useSharedValue(0);
  const standUpRotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  const animatedIconStyle = useAnimatedStyle(() => {
    const animatedColor = interpolateColor(
      pulse.value,
      [0, 1],
      ['black', color.toString()]
    );

    return {
      transform: [
        { rotate: `${iconRotation.value + standUpRotation.value}deg` },
        { translateY: translateY.value },
      ],
      color: animatedColor,
      opacity: opacity ?? 1,
    };
  });

  useImperativeHandle(ref, () => ({
    pulse: () => {
      pulse.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) })
      );
    },
    standUp: () => {
      standUpRotation.value = withSequence(
        withTiming(15, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(-rotation, { duration: 600, easing: Easing.out(Easing.cubic) }),
      );
    
      translateY.value = withSequence(
        withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(-80, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(-20, { duration: 200, easing: Easing.out(Easing.quad) })  
      );

      pulse.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }), 
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }), 
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
        withDelay(600, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }))
      );
    }
  }));

  return (
    <Animated.View style={styles.optionContainer}>
      <AnimatedIcon name="accessibility" style={animatedIconStyle} size={120} />
    </Animated.View>
  );
});

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
