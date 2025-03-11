// FlipClockDigit.tsx
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

type DigitProps = {
  current: string;
  next: string;
  style?: any;
  duration?: number;
};

// Track prev values outside component to avoid recreating refs
const prevValues = new Map<string, {current: string, next: string}>()

export default function FlipClockDigit({
  current,
  next,
  style,
  duration = 0.7
}: DigitProps) {
  // Create a unique ID for this digit instance
  const idRef = useRef(`digit-${Math.random().toString(36).substring(2, 9)}`)
  const id = idRef.current

  // Initialize shared animation values
  const progress = useSharedValue(0)

  // Check if we need to animate
  useEffect(() => {
    const prevValue = prevValues.get(id)

    // Only animate when digit changes and we have a previous value
    if (prevValue && prevValue.current !== current) {
      console.log(`Digit ${id} changed: ${prevValue.current} → ${current}`)

      // Reset and start animation
      progress.value = 0
      progress.value = withTiming(1, {
        duration: duration * 1000,
        easing: Easing.out(Easing.cubic)
      })
    }

    // Update stored value for next comparison
    prevValues.set(id, { current, next })
  }, [current, next, id, duration])

  // Top half animation styles
  const topHalfStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(
      progress.value,
      [0, 1],
      [0, -180],
      Extrapolate.CLAMP
    )

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` }
      ],
      zIndex: 2
    }
  })

  // Bottom half animation styles
  const bottomHalfStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 0.5001, 1],
      [0, 0, 1, 1],
      Extrapolate.CLAMP
    )

    return {
      opacity,
      zIndex: 3
    }
  })

  return (
    <View style={[styles.digitBlock, style]}>
      {/* Static top half showing current digit */}
      <View style={styles.staticHalf}>
        <Text style={styles.digitText}>{current}</Text>
      </View>

      {/* Static bottom half showing next digit */}
      <View style={[styles.staticHalf, styles.bottomHalf]}>
        <Text style={styles.digitText}>{next}</Text>
      </View>

      {/* Animated top half */}
      <Animated.View style={[styles.flipCard, topHalfStyle]}>
        <Text style={styles.digitText}>{current}</Text>
      </Animated.View>

      {/* Animated bottom half */}
      <Animated.View style={[styles.flipCard, styles.flipCardBottom, bottomHalfStyle]}>
        <Text style={styles.digitText}>{next}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  digitBlock: {
    width: 46,
    height: 80,
    position: "relative",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#0f181a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3
  },
  digitText: {
    fontSize: 50,
    color: "#ffffff",
    fontWeight: "500",
    textAlign: "center",
    width: "100%"
  },
  staticHalf: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 1
  },
  bottomHalf: {
    top: "50%",
    justifyContent: "flex-start",
    borderBottomWidth: 0
  },
  flipCard: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#0f181a",
    backfaceVisibility: "hidden",
    transformOrigin: "center bottom",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.4)"
  },
  flipCardBottom: {
    top: "50%",
    justifyContent: "flex-start",
    transformOrigin: "center top",
    transform: [{ rotateX: "180deg" }],
    borderBottomWidth: 0
  }
})
