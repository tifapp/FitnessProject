import { useEffect, useRef } from 'react';

type InterpolationFunction = (progress: number) => number;

const linearInterpolation: InterpolationFunction = (progress: number) => progress;

export const useFade = (
  initialValue: number,
  setValue: (value: number) => void
) => {
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentValueRef = useRef<number>(initialValue);

  const interpolate = (
    duration: number,
    targetValue: number,
    interpolationFunction: InterpolationFunction = linearInterpolation
  ) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = null;

    const initial = currentValueRef.current;
    const delta = targetValue - initial;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = interpolationFunction( Math.min(elapsed / duration, 1) );

      const newValue = initial + delta * progress;
      setValue(newValue);
      currentValueRef.current = newValue;

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const fadeIn = (
    duration: number = 1000,
    targetValue: number = 1,
    interpolationFunction?: InterpolationFunction
  ) => {
    interpolate(duration, targetValue, interpolationFunction);
  };

  const fadeOut = (
    duration: number = 1000,
    targetValue: number = 0,
    interpolationFunction?: InterpolationFunction
  ) => {
    interpolate(duration, targetValue, interpolationFunction);
  };

  const clearFade = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearFade();
    };
  }, []);

  return { fadeIn, fadeOut };
};
