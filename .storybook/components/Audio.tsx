import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

export const useAudioFade = (sound: Audio.Sound | null) => {
  const fadeInIntervalRef = useRef<number | null>(null); // Use ref to track fadeIn interval
  const fadeOutIntervalRef = useRef<number | null>(null); // Use ref to track fadeOut interval

  useEffect(() => {
    return () => {
      sound?.unloadAsync(); // Cleanup sound when component unmounts
      clearFadeIn();
      clearFadeOut();
    };
  }, [sound]);

  const clearFadeIn = () => {
    if (fadeInIntervalRef.current !== null) {
      clearInterval(fadeInIntervalRef.current);
      fadeInIntervalRef.current = null;
    }
  };

  const clearFadeOut = () => {
    if (fadeOutIntervalRef.current !== null) {
      clearInterval(fadeOutIntervalRef.current);
      fadeOutIntervalRef.current = null;
    }
  };

  // Function to adjust volume
  const setVolume = async (volume: number) => {
    if (sound) {
      await sound.setVolumeAsync(volume);
    }
  };

  // Fade-in function
  const fadeIn = async (duration: number = 1000) => {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    let volume = status.volume; // Start from the current volume
    const interval = 100; // adjust volume every 100ms
    const step = ((1 - volume) * interval) / duration; // The amount to increase each interval

    clearFadeOut(); // Stop any ongoing fade-out
    fadeInIntervalRef.current = setInterval(() => {
      if (volume < 1) {
        volume += step;
        setVolume(Math.min(volume, 1)); // Ensure volume doesn't go above 1
      } else {
        clearFadeIn(); // Stop fading in when volume reaches 1
      }
    }, interval) as unknown as number; // TypeScript fix for setInterval return type
  };

  // Fade-out function
  const fadeOut = async (duration: number = 1000) => {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    let volume = status.volume; // Start from the current volume
    const interval = 100; // adjust volume every 100ms
    const step = (volume * interval) / duration; // The amount to decrease each interval

    clearFadeIn(); // Stop any ongoing fade-in
    fadeOutIntervalRef.current = setInterval(() => {
      if (volume > 0) {
        volume -= step;
        setVolume(Math.max(volume, 0)); // Ensure volume doesn't go below 0
      } else {
        clearFadeOut(); // Stop fading out when volume reaches 0
      }
    }, interval) as unknown as number; // TypeScript fix for setInterval return type
  };

  // Return the hook functions and state
  return { fadeIn, fadeOut, clearFadeIn, clearFadeOut };
};

