import React, { useEffect } from "react"
import { Dimensions } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"
import Svg, {
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg"

const { width } = Dimensions.get("window")

// Create animated SVG component
const AnimatedView = Animated.createAnimatedComponent(Animated.View)

// Type definitions
interface BalloonData {
  id: number;
  initialLeft: number;
  top: number;
  size: number;
  horizontalSpeed: number;
  verticalSpeed: number;
  verticalAmount: number;
  color1: string;
  color2: string;
  delay: number;
  zIndex: number;
}

interface BalloonComponentProps {
  balloon: BalloonData;
}

// Balloon Component with vertical bobbing animation and proper looping
const BalloonComponent: React.FC<BalloonComponentProps> = ({ balloon }) => {
  const translateX: SharedValue<number> = useSharedValue(balloon.initialLeft)
  const translateY: SharedValue<number> = useSharedValue(0)
  const balloonWidth = 80 * balloon.size
  const balloonHeight = 120 * balloon.size // Increased height to ensure the top is not cut off

  // Setup animation for balloon movement
  useEffect(() => {
    // Horizontal movement - animate to fully off-screen to the left
    translateX.value = withDelay(
      balloon.delay,
      withRepeat(
        withTiming(-width * 0.4, { // Animate further left to ensure it's fully off-screen
          duration: balloon.horizontalSpeed,
          easing: Easing.linear
        }),
        -1, // Infinite repeat
        false
      )
    )

    // Vertical bobbing motion
    translateY.value = withDelay(
      balloon.delay,
      withRepeat(
        withSequence(
          withTiming(-balloon.verticalAmount, {
            duration: balloon.verticalSpeed,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(0, {
            duration: balloon.verticalSpeed,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1, // Infinite repeat
        true // Smooth transition by reversing
      )
    )

    return () => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
    }
  }, [])

  // Create animated style for balloon with fixed looping logic
  const animatedStyle = useAnimatedStyle(() => {
    // Get current position
    const currentPosition = translateX.value

    // Check if balloon has moved completely off-screen to the left
    const isOffScreenLeft = currentPosition <= -balloonWidth

    // If off-screen to the left, reset to starting position (completely off-screen right)
    const adjustedX = isOffScreenLeft
      ? width + balloonWidth // Place completely off-screen right
      : currentPosition

    return {
      transform: [
        { translateX: adjustedX },
        { translateY: translateY.value }
      ],
      position: "absolute" as const,
      top: balloon.top,
      zIndex: balloon.zIndex
    }
  })

  // Enhanced balloon design
  return (
    <AnimatedView style={animatedStyle}>
      <Svg
        width={balloonWidth}
        height={balloonHeight}
        viewBox="0 0 40 70"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id={`balloonGradient${balloon.id}`} cx="0.5" cy="0.4" r="0.5" fx="0.3" fy="0.2">
            <Stop offset="0%" stopColor={balloon.color2} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={balloon.color1} stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id={`basketGradient${balloon.id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D2B48C" stopOpacity="1" />
            <Stop offset="100%" stopColor="#8B4513" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Main balloon */}
        <Ellipse
          cx="20"
          cy="22"
          rx="20"
          ry="22"
          fill={`url(#balloonGradient${balloon.id})`}
        />

        {/* Balloon highlight */}
        <Ellipse
          cx="16"
          cy="18"
          rx="10"
          ry="10"
          fill="white"
          fillOpacity="0.15"
        />

        {/* Panel lines on balloon */}
        <Path
          d="M20,0 Q30,22 20,44 Q10,22 20,0"
          fill="none"
          stroke={balloon.color2}
          strokeWidth="0.8"
          opacity="0.6"
        />
        <Path
          d="M5,22 Q20,27 35,22"
          fill="none"
          stroke={balloon.color2}
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Connection point at bottom of balloon */}
        <Rect x="19" y="44" width="2" height="1" fill="#888" />

        {/* Strings - now properly connected to the balloon bottom */}
        <Line x1="14" y1="45" x2="14" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="20" y1="45" x2="20" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="26" y1="45" x2="26" y2="56" stroke="#888" strokeWidth="0.7" />

        {/* Basket */}
        <Rect x="12" y="56" width="16" height="10" rx="2" fill={`url(#basketGradient${balloon.id})`} />
        <Rect x="13" y="56" width="14" height="2" rx="1" fill="#D2B48C" />

        {/* Basket top edge connections */}
        <Rect x="13" y="55.5" width="1.5" height="1" fill="#888" />
        <Rect x="19.3" y="55.5" width="1.5" height="1" fill="#888" />
        <Rect x="25.5" y="55.5" width="1.5" height="1" fill="#888" />
      </Svg>
    </AnimatedView>
  )
}

export default BalloonComponent
