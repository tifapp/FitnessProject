import React, { FC, memo, useEffect } from "react";
import {
  StyleSheet
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

// Props interface for the FadingOverlay component
interface FadingOverlayProps {
  duration?: number;
  initialOpacity?: number;
  onComplete?: () => void;
  color?: string;
  fadeIn?: boolean;
  visible?: boolean;
}

// Base FadingOverlay component
const FadingOverlayBase: FC<FadingOverlayProps> = ({
  duration = 3000,
  initialOpacity = 1,
  onComplete = () => {},
  color = "white",
  fadeIn = false,
  visible = true
}) => {
  // Use Reanimated shared value for better performance
  const opacity = useSharedValue(fadeIn ? 0 : initialOpacity)

  // Animated style using Reanimated
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      backgroundColor: color
    }
  })

  useEffect(() => {
    // Define completion handler for animation
    const handleComplete = () => {
      onComplete()
    }

    if (visible) {
      if (fadeIn) {
        // Fade in animation
        opacity.value = 0
        opacity.value = withTiming(initialOpacity, { duration })
      } else {
        // Fade out animation
        opacity.value = initialOpacity
        opacity.value = withTiming(0, { duration }, (finished) => {
          if (finished) {
            runOnJS(handleComplete)()
          }
        })
      }
    }

    // Cleanup animation on component unmount or when visibility changes
    return () => {
      cancelAnimation(opacity)
    }
  }, [visible, fadeIn, duration, initialOpacity, opacity, onComplete])

  // Only render when visible is true
  if (!visible) return null

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    />
  )
}

// Custom comparison function to determine if the component should re-render
const arePropsEqual = (prevProps: FadingOverlayProps, nextProps: FadingOverlayProps) => {
  // Compare only the props that affect the animation behavior
  return (
    prevProps.visible === nextProps.visible &&
    prevProps.fadeIn === nextProps.fadeIn &&
    prevProps.duration === nextProps.duration &&
    prevProps.initialOpacity === nextProps.initialOpacity &&
    prevProps.color === nextProps.color &&
    // For the onComplete callback, we can compare references
    // This means the component will re-render if a new function reference is passed
    prevProps.onComplete === nextProps.onComplete
  )
}

// Export the memoized version of the component
export const FadingOverlay = memo(FadingOverlayBase, arePropsEqual)

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: "center"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  description: {
    marginBottom: 16,
    color: "#666"
  },
  buttonContainer: {
    gap: 12
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "600"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999
  }
})
