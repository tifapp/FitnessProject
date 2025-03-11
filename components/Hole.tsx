import React, { useEffect } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated"
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg"

const { width, height } = Dimensions.get("window")

// Create animated versions of SVG components
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedRect = Animated.createAnimatedComponent(Rect)

export const TransparentHoleOverlay = ({
  holeRadius = 225,
  holePositionX = width / 2,
  holePositionY = height / 2.5,
  backgroundColor = "rgba(0, 0, 0, 0.8)",
  animationDuration = 800,
  onAnimationComplete = () => {}
}: {
  holeRadius?: number
  holePositionX?: number
  holePositionY?: number
  backgroundColor?: string
  animationDuration?: number
  onAnimationComplete?: () => void
}) => {
  // Animation progress value (0 to 1)
  const animationProgress = useSharedValue(0)

  // Parse the background color to get final opacity for interpolation
  const finalOpacity = parseFloat(backgroundColor.split(",")[3]) || 0.8

  // Start the animation when the component mounts
  useEffect(() => {
    animationProgress.value = 0
    animationProgress.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic)
    }, () => {
      // Call the completion callback when animation finishes
      runOnJS(onAnimationComplete)()
    })
  }, [])

  // Animated props for the circle (hole)
  const animatedCircleProps = useAnimatedProps(() => {
    const currentRadius = animationProgress.value * holeRadius
    return {
      r: currentRadius
    }
  })

  // Animated props for the rectangle (background)
  const animatedRectProps = useAnimatedProps(() => {
    // Start with fully opaque black and animate to the target backgroundColor
    const currentColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      ["rgba(0, 0, 0, 1)", backgroundColor]
    )

    return {
      fill: currentColor
    }
  })

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg height={height} width={width}>
        <Defs>
          <Mask id="mask" x="0" y="0" width="100%" height="100%">
            {/* Fill the entire area with white (opaque) */}
            <Rect x="0" y="0" width="100%" height="100%" fill="white" />

            {/* Animated circular hole */}
            <AnimatedCircle
              cx={holePositionX}
              cy={holePositionY}
              fill="black"
              animatedProps={animatedCircleProps}
            />
          </Mask>
        </Defs>

        {/* Animated background rectangle */}
        <AnimatedRect
          x="0"
          y="0"
          width="100%"
          height="100%"
          mask="url(#mask)"
          animatedProps={animatedRectProps}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none" // Makes the entire overlay transparent to touch
  }
})
