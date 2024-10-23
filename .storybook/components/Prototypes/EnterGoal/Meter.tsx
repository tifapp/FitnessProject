import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

type HeartProgressProps = {
  progress: Animated.SharedValue<number>;
  size?: number;
  color?: string;
  backgroundColor?: string;
};

export const HeartProgress: React.FC<HeartProgressProps> = ({
  progress,
  size = 80, 
  color = '#EF6351',
  backgroundColor = 'black',
}) => {
  const fadeInStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.1], [0, 1], 'clamp'); 
    return {
      opacity: opacity, 
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: progress.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, fadeInStyle]}>
      <Ionicons name="heart" size={size} color={backgroundColor} style={styles.backgroundHeart} />
      <View style={styles.overlayContainer}>
        <Animated.View style={animatedStyle}>
          <Ionicons name="heart" size={size} color={color} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 90, 
  },
  backgroundHeart: {
    position: 'absolute',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0, 
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
