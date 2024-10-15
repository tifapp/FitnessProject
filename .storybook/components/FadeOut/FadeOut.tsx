import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface FadeOutProps {
  trigger: boolean; // Boolean to trigger the 
  onComplete: () => void; // Callback once the animation is completed
}

export const FadeOut: React.FC<FadeOutProps> = ({ trigger, onComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity for the fade effect

  useEffect(() => {
    if (trigger) {
      // Start the fade animation when trigger is true
      Animated.timing(fadeAnim, {
        toValue: 1, // Fully opaque
        duration: 500, // Duration of the fade (500ms)
        useNativeDriver: true, // Use native driver for performance
      }).start(() => {
        setTimeout(onComplete, 500); // Delay before calling onComplete
      });
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        styles.fadeOverlay,
        {
          opacity: fadeAnim, // Bind opacity to animated value
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
    backgroundColor: 'white', // Fades to white
    zIndex: 10, // Ensure it is above other components
  },
});
