import React, { useEffect } from "react"
import { View } from "react-native"
import Animated, {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated"
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop
} from "react-native-svg"

// This component takes x,y coordinates as props rather than managing touch internally
export const TargetReticle = ({ x = 200, y = 300 }) => {
  // Animation values only - no position management
  const scanAngle = useSharedValue(0)
  const pulseValue = useSharedValue(1)

  // Calculate the path for the radar sweep
  const radarSweepPath = useDerivedValue(() => {
    const centerX = 100
    const centerY = 100
    const radius = 100
    const angle = scanAngle.value

    const endX = centerX + radius * Math.cos((angle - 90) * Math.PI / 180)
    const endY = centerY + radius * Math.sin((angle - 90) * Math.PI / 180)

    return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`
  })

  // For pulse opacity animation
  const animatedOpacity = useDerivedValue(() => {
    return 0.3 + (pulseValue.value * 0.5)
  })

  // Start animations
  useEffect(() => {
    // Radar sweep animation
    scanAngle.value = 0 // Reset first
    const sweepAnimation = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear
      }),
      -1, // Infinite repetitions
      false // Don't reverse
    )
    scanAngle.value = sweepAnimation

    // Pulse animation
    pulseValue.value = 0 // Reset first
    const pulseAnimation = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin)
      }),
      -1, // Infinite repetitions
      true // Reverse (ping-pong effect)
    )
    pulseValue.value = pulseAnimation
  }, [])

  // Top-level container that covers the entire screen
  const containerStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }

  // Style for reticle position - centered on the provided coordinates
  const reticleStyle = {
    position: "absolute",
    width: 320,
    height: 320,
    left: x - 160,
    top: y - 160,
    justifyContent: "center",
    alignItems: "center"
  }

  return (
    <View style={containerStyle}>
      {/* Target reticle - position from props, not animated */}
      <View style={reticleStyle}>
        {/* Layer 1: Radar sweep */}
        <Svg width="320" height="320" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="scanGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#2E8FFF" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#2E8FFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Radar sweep - animated path */}
          <AnimatedPath
            d={radarSweepPath}
            fill="url(#scanGradient)"
            opacity={animatedOpacity}
          />

          {/* Outer partial circles */}
          <Path
            d="M 100 10 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <Path
            d="M 100 190 A 90 90 0 0 1 10 100"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </Svg>

        {/* Layer 2: Middle targeting circle */}
        <View style={{ position: "absolute" }}>
          <Svg width="240" height="240" viewBox="0 0 200 200">
            <Circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#4D9FFF"
              strokeWidth="2.5"
              strokeDasharray="70,30"
            />

            {/* Targeting markers */}
            <Line x1="85" y1="100" x2="60" y2="100" stroke="white" strokeWidth="2.5" />
            <Line x1="115" y1="100" x2="140" y2="100" stroke="white" strokeWidth="2.5" />
            <Line x1="100" y1="85" x2="100" y2="60" stroke="white" strokeWidth="2.5" />
            <Line x1="100" y1="115" x2="100" y2="140" stroke="white" strokeWidth="2.5" />
          </Svg>
        </View>

        {/* Layer 3: Crosshair */}
        <View style={{ position: "absolute" }}>
          <Svg width="160" height="160" viewBox="0 0 100 100">
            {/* Crosshair lines */}
            <Line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
            <Line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="1" strokeDasharray="3,3" />

            {/* Center reticle */}
            <Circle cx="50" cy="50" r="2" fill="#2E8FFF" />
            <Circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="1.5" />
            <Circle cx="50" cy="50" r="6" fill="none" stroke="#4D9FFF" strokeWidth="1.5" />

            {/* Angle indicators */}
            <Line x1="50" y1="50" x2="70" y2="50" stroke="#4D9FFF" strokeWidth="2"
              transform="rotate(45, 50, 50)" />
            <Line x1="50" y1="50" x2="70" y2="50" stroke="#4D9FFF" strokeWidth="2"
              transform="rotate(135, 50, 50)" />
            <Line x1="50" y1="50" x2="70" y2="50" stroke="#4D9FFF" strokeWidth="2"
              transform="rotate(225, 50, 50)" />
            <Line x1="50" y1="50" x2="70" y2="50" stroke="#4D9FFF" strokeWidth="2"
              transform="rotate(315, 50, 50)" />

            {/* Additional diagonal lines for better visibility */}
            <Line x1="30" y1="30" x2="20" y2="20" stroke="white" strokeWidth="1.5" />
            <Line x1="70" y1="30" x2="80" y2="20" stroke="white" strokeWidth="1.5" />
            <Line x1="30" y1="70" x2="20" y2="80" stroke="white" strokeWidth="1.5" />
            <Line x1="70" y1="70" x2="80" y2="80" stroke="white" strokeWidth="1.5" />
          </Svg>
        </View>

        {/* Optional outer glow effect */}
        <View style={{ position: "absolute" }}>
          <Svg width="320" height="320" viewBox="0 0 200 200">
            <Circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#2E8FFF"
              strokeWidth="1"
              opacity="0.3"
            />
          </Svg>
        </View>
      </View>
    </View>
  )
}

// Create animated version of Path for the radar sweep
const AnimatedPath = Animated.createAnimatedComponent(Path)
