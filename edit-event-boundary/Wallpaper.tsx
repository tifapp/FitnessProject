import React, { useEffect } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
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
import Svg, { Ellipse, Line, Path, Rect } from "react-native-svg"

const { width, height } = Dimensions.get("window")

// Create animated SVG components
const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const AnimatedView = Animated.createAnimatedComponent(View)

// Type definitions
interface BalloonData {
  id: number;
  initialLeft: number;
  top: number;
  size: number;
  speed: number;
  color1: string;
  color2: string;
  delay: number;
}

interface CloudData {
  id: number;
  initialLeft: number;
  top: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

interface BalloonComponentProps {
  balloon: BalloonData;
}

interface CloudComponentProps {
  cloud: CloudData;
}

const BalloonWallpaper: React.FC = () => {
  // Generate balloons and clouds data
  const balloons: BalloonData[] = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    initialLeft: width + (i * width * 0.2),
    top: height * (0.1 + Math.random() * 0.3),
    size: 0.8 + Math.random() * 0.4,
    speed: 15000 + Math.random() * 5000, // Animation duration in ms
    color1: getRandomColor(),
    color2: getRandomColor(),
    delay: i * 2000 // Staggered start
  }))

  const clouds: CloudData[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    initialLeft: width * (Math.random() * 0.8),
    top: height * (0.05 + Math.random() * 0.3),
    size: 0.5 + Math.random() * 0.5,
    speed: 20000 + Math.random() * 10000, // Slower than balloons
    opacity: 0.3 + Math.random() * 0.4,
    delay: i * 1000 // Staggered start
  }))

  // Random color generator
  function getRandomColor(): string {
    const colors: string[] = [
      "#FF6B6B", "#4ECDC4", "#FFD166",
      "#06D6A0", "#118AB2", "#EF476F",
      "#FFC6FF", "#CAFFBF", "#9BF6FF"
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <View style={styles.container}>
      {/* Sky gradient background */}
      <View style={styles.skyBackground} />

      {/* Clouds */}
      {clouds.map(cloud => (
        <CloudComponent key={cloud.id} cloud={cloud} />
      ))}

      {/* Hot Air Balloons */}
      {balloons.map(balloon => (
        <BalloonComponent key={balloon.id} balloon={balloon} />
      ))}

      {/* Subtle ground/horizon layer */}
      <View style={styles.horizon} />
    </View>
  )
}

// Separated Cloud Component with its own animation
const CloudComponent: React.FC<CloudComponentProps> = ({ cloud }) => {
  const translateX: SharedValue<number> = useSharedValue(cloud.initialLeft)

  // Setup animation for cloud movement
  useEffect(() => {
    const setupAnimation = (): void => {
      // Animation sequence: move from initial position to off-screen left
      translateX.value = withDelay(
        cloud.delay,
        withRepeat(
          withSequence(
            withTiming(cloud.initialLeft, { duration: 0 }),
            withTiming(-width * 0.3, {
              duration: cloud.speed,
              easing: Easing.linear
            })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        )
      )
    }

    setupAnimation()

    return () => {
      cancelAnimation(translateX)
    }
  }, [])

  // Create animated style for cloud
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      position: "absolute" as const,
      top: cloud.top
    }
  })

  return (
    <AnimatedView style={animatedStyle}>
      <Svg width={100 * cloud.size} height={60 * cloud.size} viewBox="0 0 30 20">
        <Ellipse cx="10" cy="10" rx="10" ry="6" fill="white" opacity={cloud.opacity} />
        <Ellipse cx="17" cy="8" rx="8" ry="6" fill="white" opacity={cloud.opacity} />
        <Ellipse cx="3" cy="9" rx="7" ry="5" fill="white" opacity={cloud.opacity} />
      </Svg>
    </AnimatedView>
  )
}

// Separated Balloon Component with its own animation
const BalloonComponent: React.FC<BalloonComponentProps> = ({ balloon }) => {
  const translateX: SharedValue<number> = useSharedValue(balloon.initialLeft)

  // Setup animation for balloon movement
  useEffect(() => {
    const setupAnimation = (): void => {
      // Animation sequence: move from initial position to off-screen left
      translateX.value = withDelay(
        balloon.delay,
        withRepeat(
          withSequence(
            withTiming(balloon.initialLeft, { duration: 0 }),
            withTiming(-width * 0.3, {
              duration: balloon.speed,
              easing: Easing.linear
            })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        )
      )
    }

    setupAnimation()

    return () => {
      cancelAnimation(translateX)
    }
  }, [])

  // Create animated style for balloon
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      position: "absolute" as const,
      top: balloon.top
    }
  })

  return (
    <AnimatedView style={animatedStyle}>
      <Svg
        width={40 * balloon.size}
        height={50 * balloon.size}
        viewBox="0 0 20 35"
      >
        {/* Balloon */}
        <Ellipse
          cx="10"
          cy="12"
          rx="10"
          ry="12"
          fill={balloon.color1}
        />

        {/* Balloon pattern */}
        <Path
          d="M10,0 Q15,12 10,24 Q5,12 10,0"
          fill={balloon.color2}
          fillOpacity="0.7"
        />

        {/* Strings */}
        <Line x1="7" y1="24" x2="6" y2="30" stroke="#888" strokeWidth="0.5" />
        <Line x1="13" y1="24" x2="14" y2="30" stroke="#888" strokeWidth="0.5" />
        <Line x1="10" y1="24" x2="10" y2="30" stroke="#888" strokeWidth="0.5" />

        {/* Basket */}
        <Rect x="6" y="30" width="8" height="5" fill="#8B4513" rx="1" />
      </Svg>
    </AnimatedView>
  )
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative"
  },
  skyBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#87CEEB"
  },
  horizon: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.05,
    backgroundColor: "rgba(60, 179, 113, 0.3)"
  }
})

export default BalloonWallpaper
