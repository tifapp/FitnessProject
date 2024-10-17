import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface FadeOutProps {
  trigger: boolean; // Boolean to trigger the 
  onComplete: () => void; // Callback once the animation is completed
  delay?: number;
}

export const FadeOut: React.FC<FadeOutProps> = ({ trigger, onComplete, delay = 0 }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity for the fade effect

  useEffect(() => {
    if (trigger) {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1, // Fully opaque
          duration: 500, // Duration of the fade (500ms)
          useNativeDriver: true, // Use native driver for performance
        }).start(() => {
          setTimeout(onComplete, 500); // Delay before calling onComplete
        });
      }, delay)
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <Animated.View
      style={[
        styles.fadeOverlay,
        {
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
    height: 10000,
    opacity: 0.01
  },
});
