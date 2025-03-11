import React, { useEffect } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"

// Create animated versions of svg components
const AnimatedPath = Animated.createAnimatedComponent(Path)

export const CartographicBackground = () => {
  const { width, height } = Dimensions.get("window")

  // Shared values for animations
  const rotation = useSharedValue(0)
  const scanPosition = useSharedValue(0)

  // Setup animations with Reanimated
  useEffect(() => {
    // Slow continuous rotation for longitude lines
    rotation.value = withRepeat(
      withTiming(100, {
        duration: 500000, // Very slow rotation
        easing: Easing.linear
      }),
      -1, // Infinite repeats
      false // No reverse
    )

    // Faster scan effect for latitude lines
    scanPosition.value = withRepeat(
      withTiming(28.57, {
        duration: 14000, // 14 seconds to complete a full cycle
        easing: Easing.linear
      }),
      -1, // Infinite repeats
      false // No reverse
    )

    return () => {
      // Cleanup animations
      cancelAnimation(rotation)
      cancelAnimation(scanPosition)
    }
  }, [])

  // Render longitude lines
  const renderLongitudeLines = () => {
    const lines = []
    // Add "offset" lines that extend beyond the edge of the screen
    const lineCount = 10 // Increased for better edge coverage

    // Draw lines across the full width with offset to ensure coverage
    for (let i = -2; i < lineCount + 2; i++) {
      lines.push(
        <LongitudeLine key={`long-${i}`} index={i} rotation={rotation} lineCount={lineCount} />
      )
    }
    return lines
  }

  // Render latitude lines with scanning effect
  const renderLatitudeLines = () => {
    const lines = []
    const lineCount = 7

    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <LatitudeLine key={`lat-${i}`} index={i} scanPosition={scanPosition} />
      )
    }
    return lines
  }

  return (
    <View style={styles.container}>
      <View style={[styles.background, { width, height }]}>
        <Svg
          width="100%"
          height="100%"
          viewBox="-25 0 150 200" // Expanded further to ensure full coverage
          preserveAspectRatio="xMidYMid slice"
        >
          {renderLongitudeLines()}
          {renderLatitudeLines()}
        </Svg>
      </View>
    </View>
  )
}

// Separate component for longitude lines to optimize rendering
const LongitudeLine = ({
  index,
  rotation,
  lineCount
}: {
  index: number,
  rotation: SharedValue<number>,
  lineCount: number
}) => {
  const animatedProps = useAnimatedProps(() => {
    // Calculate x position with rotation offset
    const x = ((index + rotation.value / 4) % lineCount) * (100 / lineCount)

    // The center of our viewBox is at x=50
    const centerX = 50

    // Calculate if the line is left or right of center
    const isRightSide = x > centerX

    // Calculate distance from center (0 to 1)
    const distFromCenter = Math.abs(x - centerX) / 50

    // Direction of curve - curve should go OUTWARD from center line
    const sign = isRightSide ? 1 : -1

    // Calculate curve strength based on distance from center
    // Lines farther from center curve more - increased from 40 to 55 for more bend
    const curveStrength = 55 * distFromCenter

    // Top point converges toward center but not too much (0.7 = 30% convergence)
    const topX = centerX + (x - centerX) * 0.7

    // Bottom point diverges from center
    const bottomX = centerX + (x - centerX) * 1.4

    // Opacity fades with distance from center
    const opacityFactor = 0.1 + (distFromCenter * 0.15)

    return {
      // Use quadratic Bezier curve with control point OUTSIDE the line
      // This creates the proper outward curve for a sphere
      d: `M ${topX} 0 Q ${x + sign * curveStrength} 100 ${bottomX} 200`,
      stroke: `rgba(120, 120, 120, ${opacityFactor})`,
      strokeWidth: 0.25,
      strokeDasharray: "1,2",
      fill: "none"
    }
  })

  return <AnimatedPath animatedProps={animatedProps} />
}

// Separate component for latitude lines to optimize rendering
const LatitudeLine = ({ index, scanPosition }: {index: number, scanPosition: SharedValue<number>}) => {
  const animatedProps = useAnimatedProps(() => {
    // Calculate position with scanPosition offset
    const yBase = (index * 200) / 7
    const y = (yBase + scanPosition.value) % 200

    // Distance from middle (0 at middle, 1 at top/bottom)
    const distFromMiddle = Math.abs(y - 100) / 100

    // Use a more subtle curve that's consistent with spherical projection
    // This creates a more gentle upward curve for all horizontal lines
    const curveFactor = 8 * (1 - distFromMiddle * distFromMiddle * distFromMiddle)

    // Dramatic fade into distance
    const opacityTop = 0.05
    const opacityBottom = 0.2
    const opacityFactor = opacityTop + ((opacityBottom - opacityTop) * (y / 200))

    return {
      // Extended further to cover the expanded viewBox completely
      d: `M -25 ${y} Q 50 ${y + curveFactor} 125 ${y}`,
      stroke: `rgba(120, 120, 120, ${opacityFactor})`,
      strokeWidth: 0.25,
      strokeDasharray: "1,2",
      fill: "none"
    }
  })

  return <AnimatedPath animatedProps={animatedProps} />
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  background: {
    backgroundColor: "white",
    overflow: "hidden"
  }
})
