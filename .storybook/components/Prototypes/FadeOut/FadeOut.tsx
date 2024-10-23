import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useFade } from "../utils/Interpolate";

interface FadeOutProps {
  trigger: boolean;
  onComplete: () => void;
  fadeDuration?: number;
  delay?: number;
}

export const FadeOut: React.FC<FadeOutProps> = ({ trigger, onComplete, fadeDuration = 500, delay = 0 }) => {
  const [fade, setFade] = useState(0);
  const {fadeIn} = useFade(fade, setFade)

  useEffect(() => {
    if (trigger) {
      setTimeout(() => {
        fadeIn(fadeDuration)
        setTimeout(onComplete, fadeDuration)
      }, delay)
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <Animated.View
      style={[
        styles.fadeOverlay,
        {
          opacity: fade,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  fadeOverlay: {
    position: 'absolute',
    top: -500,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
    height: 10000,
    opacity: 0.01
  },
});
