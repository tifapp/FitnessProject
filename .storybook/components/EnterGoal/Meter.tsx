// HeartProgress.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

type HeartProgressProps = {
  progress: Animated.SharedValue<number>; // Value between 0 and 1
  size?: number;
  color?: string;
  backgroundColor?: string; // Optional background color for the empty heart
};

export const HeartProgress: React.FC<HeartProgressProps> = ({
  progress,
  size = 80, // Default size for the heart icon
  color = '#EF6351', // Default color for the growing heart
  backgroundColor = 'black', // Black background heart
}) => {
  // Animated style for the entire heart's fade-in effect (linear fade-in by 0.1 progress)
  const fadeInStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.1], [0, 1], 'clamp'); // Fade in linearly up to 0.1 progress
    return {
      opacity: opacity, // No timing, let interpolation handle it for smoothness
    };
  });

  // Animated style for the "growing" colored heart, adjusting its scale based on progress
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: progress.value, // Slowly grow the colored heart as progress increases
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, fadeInStyle]}>
      {/* Static black heart icon in the background */}
      <Ionicons name="heart" size={size} color={backgroundColor} style={styles.backgroundHeart} />

      {/* Animated colored heart icon growing inside the black heart */}
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
    top: 90, // Align the growing heart
  },
  backgroundHeart: {
    position: 'absolute', // Keeps the black heart fixed in place
  },
  overlayContainer: {
    position: 'absolute',
    top: 0, // Align the growing heart
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
