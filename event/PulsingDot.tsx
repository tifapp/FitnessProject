import { AppStyles } from "@lib/AppColorStyle"
import React, { useEffect } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"

interface FadingDotProps {
  size?: number
  color?: string
  minOpacity?: number
  maxOpacity?: number
  fadeDuration?: number
  pauseDuration?: number
  style?: ViewStyle
}

const FadingDot: React.FC<FadingDotProps> = ({
  size = 10,
  color = "#4CAF50",
  minOpacity = 0,
  maxOpacity = 1,
  fadeDuration = 2000, // Duration for fade in or out (each direction)
  pauseDuration = 300, // Pause at max opacity
  style
}) => {
  // Create shared animated value for opacity
  const opacity = useSharedValue(minOpacity)

  // Set up the fading animation with Reanimated
  useEffect(() => {
    // Explicitly setting the initial value to ensure we start at minOpacity
    opacity.value = minOpacity

    // Small delay to ensure the component is mounted before animation starts
    const timeout = setTimeout(() => {
      // Define a complete cycle: min -> max -> pause -> min
      const animationCycle = withSequence(
        // Fade in from min to max
        withTiming(maxOpacity, {
          duration: fadeDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1) // Material Design standard curve
        }),

        // Hold at max opacity
        withTiming(maxOpacity, {
          duration: pauseDuration
        }),

        // Fade out from max to min
        withTiming(minOpacity, {
          duration: fadeDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1) // Same curve for consistency
        })
      )

      // Start the infinite loop animation
      opacity.value = withRepeat(animationCycle, -1, false)
    }, 50)

    // Clean up animations and timeouts
    return () => {
      clearTimeout(timeout)
      cancelAnimation(opacity)
    }
  }, [minOpacity, maxOpacity, fadeDuration, pauseDuration, opacity])

  // Create animated style for the fading effect
  const fadingStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))

  return (
    <View style={[styles.container, style]}>
      <View
        style={{
          backgroundColor: AppStyles.colorOpacity10.toString(),
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2
        }}
      />
      <Animated.View
        style={[
          fadingStyle,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -1
  }
})

export default FadingDot
