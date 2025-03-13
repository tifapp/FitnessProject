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
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg"

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
  horizontalSpeed: number;
  verticalSpeed: number;
  verticalAmount: number;
  color1: string;
  color2: string;
  delay: number;
  zIndex: number;
}

interface CloudData {
  id: number;
  initialLeft: number;
  top: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  delay: number;
  zIndex: number;
  scale: number;
}

interface BalloonComponentProps {
  balloon: BalloonData;
}

interface CloudComponentProps {
  cloud: CloudData;
}

interface UserBalloonProps {
  // No need for horizontal movement props
  size: number;
  color1: string;
  color2: string;
  verticalAmount: number;
  verticalSpeed: number;
  zIndex: number;
}

export const SidewaysWallpaper: React.FC = () => {
  // Generate balloons with different layers (distances/speeds)
  const balloons: BalloonData[] = [
    // Distant balloons (smaller, slower, higher)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: i,
      initialLeft: width + (i * width * 0.3),
      top: height * (0.05 + Math.random() * 0.15),
      size: 0.4 + Math.random() * 0.2,
      horizontalSpeed: 35000 + Math.random() * 10000, // Slower
      verticalSpeed: 4000 + Math.random() * 1000,
      verticalAmount: 5 + Math.random() * 5, // Small vertical movement
      color1: getRandomPastelColor(0.7),
      color2: getRandomPastelColor(0.5),
      delay: i * 3000,
      zIndex: 1
    })),
    // Mid-distance balloons
    ...Array.from({ length: 4 }, (_, i) => ({
      id: i + 3,
      initialLeft: width + (i * width * 0.25),
      top: height * (0.15 + Math.random() * 0.2),
      size: 0.7 + Math.random() * 0.3,
      horizontalSpeed: 25000 + Math.random() * 8000,
      verticalSpeed: 3500 + Math.random() * 1000,
      verticalAmount: 10 + Math.random() * 10,
      color1: getRandomBrightColor(),
      color2: getRandomBrightColor(),
      delay: i * 2500,
      zIndex: 2
    })),
    // Foreground balloons (larger, faster, lower)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: i + 7,
      initialLeft: width + (i * width * 0.2),
      top: height * (0.25 + Math.random() * 0.2),
      size: 1.0 + Math.random() * 0.5,
      horizontalSpeed: 18000 + Math.random() * 5000, // Faster
      verticalSpeed: 3000 + Math.random() * 1000,
      verticalAmount: 15 + Math.random() * 15, // More vertical movement
      color1: getRandomVibrantColor(),
      color2: getRandomVibrantColor(),
      delay: i * 2000,
      zIndex: 3
    }))
  ]

  // Generate clouds with varying distances/speeds - UPDATED to ensure off-screen start
  const clouds: CloudData[] = [
    // Background clouds (higher, slower, more transparent)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: i,
      initialLeft: width + Math.random() * (width * 0.5), // Ensure all start off-screen
      top: height * (0.02 + Math.random() * 0.1),
      width: 120 + Math.random() * 80,
      height: 60 + Math.random() * 40,
      speed: 35000 + Math.random() * 15000, // Very slow
      opacity: 0.3 + Math.random() * 0.2,
      delay: i * 1500,
      zIndex: 0,
      scale: 0.5 + Math.random() * 0.3
    })),
    // Mid-level clouds
    ...Array.from({ length: 5 }, (_, i) => ({
      id: i + 4,
      initialLeft: width + Math.random() * (width * 0.5), // Ensure all start off-screen
      top: height * (0.1 + Math.random() * 0.15),
      width: 150 + Math.random() * 100,
      height: 70 + Math.random() * 50,
      speed: 25000 + Math.random() * 10000,
      opacity: 0.4 + Math.random() * 0.3,
      delay: i * 1200,
      zIndex: 1,
      scale: 0.7 + Math.random() * 0.3
    })),
    // Foreground clouds (lower, faster, more opaque)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: i + 9,
      initialLeft: width + Math.random() * (width * 0.5), // Ensure all start off-screen
      top: height * (0.2 + Math.random() * 0.1),
      width: 200 + Math.random() * 150,
      height: 90 + Math.random() * 60,
      speed: 20000 + Math.random() * 8000,
      opacity: 0.5 + Math.random() * 0.3,
      delay: i * 1000,
      zIndex: 2,
      scale: 0.9 + Math.random() * 0.3
    }))
  ]

  // User's balloon properties
  const userBalloonProps: UserBalloonProps = {
    size: 2.0, // Larger size to make it distinct
    color1: "#FF4081", // Distinctive bright pink
    color2: "#9C27B0", // Purple for gradient
    verticalAmount: 20, // Gentle vertical movement
    verticalSpeed: 8000, // Slower, more relaxed floating
    zIndex: 5 // In front of other balloons
  }

  // Random color generators with better palettes
  function getRandomPastelColor(opacity = 1): string {
    const colors: string[] = [
      `rgba(230, 230, 250, ${opacity})`, // Lavender
      `rgba(230, 230, 250, ${opacity})`, // Light blue
      `rgba(255, 240, 245, ${opacity})`, // Lavender blush
      `rgba(240, 255, 240, ${opacity})`, // Honeydew
      `rgba(255, 250, 240, ${opacity})`, // Floral white
      `rgba(245, 255, 250, ${opacity})` // Mint cream
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  function getRandomBrightColor(): string {
    const colors: string[] = [
      "#FFCC80", // Light Orange
      "#81D4FA", // Light Blue
      "#A5D6A7", // Light Green
      "#FFAB91", // Light Red
      "#CE93D8", // Light Purple
      "#F48FB1", // Light Pink
      "#90CAF9" // Sky Blue
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  function getRandomVibrantColor(): string {
    const colors: string[] = [
      "#FF6B6B", // Vibrant Red
      "#4ECDC4", // Teal
      "#FFD166", // Yellow
      "#06D6A0", // Green
      "#118AB2", // Blue
      "#EF476F", // Pink
      "#FFC6FF", // Light Purple
      "#CAFFBF" // Light Green
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <View style={styles.container}>
      {/* Sky gradient background using SVG */}
      <Svg style={styles.skyBackground} width="100%" height="100%">
        <Defs>
          <LinearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4A90E2" stopOpacity="1" />
            <Stop offset="100%" stopColor="#81C6FF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#skyGradient)" />
      </Svg>

      {/* Clouds sorted by z-index */}
      {clouds
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(cloud => (
          <CloudComponent key={cloud.id} cloud={cloud} />
        ))}

      {/* Hot Air Balloons sorted by z-index */}
      {balloons
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(balloon => (
          <BalloonComponent key={balloon.id} balloon={balloon} />
        ))}

      {/* User's balloon in the middle */}
      <UserBalloon {...userBalloonProps} />

      {/* Enhanced horizon/ground layer with SVG gradient */}
      <View style={styles.horizonContainer}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="horizonGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="rgba(60, 179, 113, 0)" stopOpacity="0" />
              <Stop offset="50%" stopColor="rgba(60, 179, 113, 0.3)" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="rgba(34, 139, 34, 0.4)" stopOpacity="0.4" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#horizonGradient)" />
        </Svg>
      </View>
    </View>
  )
}

// User's Balloon Component - centered, only floats vertically
const UserBalloon: React.FC<UserBalloonProps> = ({
  size,
  color1,
  color2,
  verticalAmount,
  verticalSpeed,
  zIndex
}) => {
  const translateY = useSharedValue(0)
  const balloonWidth = 125 * size
  const balloonHeight = 175 * size

  // Position in the middle of the screen
  const positionX = width / 2 - balloonWidth / 2
  const positionY = height * 0.3 // Place it at about 30% from the top

  // Increased vertical amount for more apparent floating
  const enhancedVerticalAmount = verticalAmount * 1.5

  useEffect(() => {
    // Only vertical bobbing motion - no horizontal movement
    // Enhanced vertical movement with larger amplitude
    translateY.value = withRepeat(
      withSequence(
        withTiming(-enhancedVerticalAmount, {
          duration: verticalSpeed * 0.6, // Slightly faster for more noticeable movement
          easing: Easing.inOut(Easing.sin)
        }),
        withTiming(0, {
          duration: verticalSpeed * 0.6,
          easing: Easing.inOut(Easing.sin)
        })
      ),
      -1, // Infinite repeat
      true // Smooth transition by reversing
    )

    return () => {
      cancelAnimation(translateY)
    }
  }, [])

  // Create animated style for the user's balloon
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value }
      ],
      position: "absolute" as const,
      left: positionX,
      top: positionY,
      zIndex
    }
  })

  // Brighter basket colors
  const brightBasketColor = "#F0A868" // Bright orange/tan
  const brightBasketBorderColor = "#E27D2C" // Darker orange for contrast
  const basketDetailColor = "#DB582C" // Bright reddish-brown

  // Enhanced user balloon design with distinct features
  return (
    <AnimatedView style={animatedStyle}>
      <Svg
        width={balloonWidth}
        height={balloonHeight}
        viewBox="0 -5 40 75"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id="userBalloonGradient" cx="0.5" cy="0.4" r="0.5" fx="0.3" fy="0.2">
            <Stop offset="0%" stopColor={color2} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color1} stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id="userBasketGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={brightBasketColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={brightBasketBorderColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Solid white background behind the balloon */}
        <Ellipse
          cx="20"
          cy="22"
          rx="22" // Slightly larger to create a white border effect
          ry="24"
          fill="white"
          opacity="0.8"
        />

        {/* Main balloon */}
        <Ellipse
          cx="20"
          cy="22"
          rx="20"
          ry="22"
          fill="url(#userBalloonGradient)"
        />

        {/* Balloon highlight */}
        <Ellipse
          cx="16"
          cy="18"
          rx="10"
          ry="10"
          fill="white"
          fillOpacity="0.25"
        />

        {/* Panel lines on balloon - more decorative for user balloon */}
        <Path
          d="M20,0 Q30,22 20,44 Q10,22 20,0"
          fill="none"
          stroke={color2}
          strokeWidth="0.8"
          opacity="0.6"
        />
        <Path
          d="M5,22 Q20,27 35,22"
          fill="none"
          stroke={color2}
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Additional decorative lines for user balloon */}
        <Path
          d="M10,10 Q20,15 30,10"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.6"
        />
        <Path
          d="M10,35 Q20,30 30,35"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Strings - diagonal connections */}
        <Line x1="12" y1="42" x2="14" y2="56" stroke="#888" strokeWidth="0.8" />
        <Line x1="20" y1="44" x2="20" y2="56" stroke="#888" strokeWidth="0.8" />
        <Line x1="28" y1="42" x2="26" y2="56" stroke="#888" strokeWidth="0.8" />

        {/* Basket - brighter colors for user balloon */}
        <Rect x="12" y="56" width="16" height="10" rx="2" fill="url(#userBasketGradient)" />
        <Rect x="13" y="56" width="14" height="2" rx="1" fill={brightBasketColor} />

        {/* Basket details with brighter color */}
        <Line x1="16" y1="58" x2="16" y2="65" stroke={basketDetailColor} strokeWidth="0.5" />
        <Line x1="20" y1="58" x2="20" y2="65" stroke={basketDetailColor} strokeWidth="0.5" />
        <Line x1="24" y1="58" x2="24" y2="65" stroke={basketDetailColor} strokeWidth="0.5" />

        {/* Basket top edge connections */}
        <Circle cx="14" cy="56" r="0.8" fill="#888" />
        <Circle cx="20" cy="56" r="0.8" fill="#888" />
        <Circle cx="26" cy="56" r="0.8" fill="#888" />
      </Svg>
    </AnimatedView>
  )
}

// Improved Cloud Component with better animation - FIXED looping to prevent on-screen spawning
const CloudComponent: React.FC<CloudComponentProps> = ({ cloud }) => {
  const translateX: SharedValue<number> = useSharedValue(cloud.initialLeft)
  const translateY: SharedValue<number> = useSharedValue(0)

  // Setup animation for cloud movement
  useEffect(() => {
    // Animation for horizontal movement - animate fully off-screen
    translateX.value = withDelay(
      cloud.delay,
      withRepeat(
        withTiming(-cloud.width * 1.5, { // Move further left to ensure fully off-screen
          duration: cloud.speed,
          easing: Easing.linear
        }),
        -1, // Infinite repeat
        false
      )
    )

    // Add subtle vertical drift
    translateY.value = withDelay(
      cloud.delay,
      withRepeat(
        withSequence(
          withTiming(2 + Math.random() * 3, {
            duration: 5000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(-2 - Math.random() * 3, {
            duration: 5000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    )

    return () => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
    }
  }, [])

  // Create animated style for cloud with fixed looping logic
  const animatedStyle = useAnimatedStyle(() => {
    // Get current position
    const currentPosition = translateX.value

    // Check if cloud has moved completely off-screen to the left
    const isOffScreenLeft = currentPosition <= -cloud.width

    // If off-screen to the left, reset to starting position (completely off-screen right)
    const adjustedX = isOffScreenLeft
      ? width + cloud.width // Place completely off-screen right
      : currentPosition

    return {
      transform: [
        { translateX: adjustedX },
        { translateY: translateY.value },
        { scale: cloud.scale }
      ],
      position: "absolute" as const,
      top: cloud.top,
      zIndex: cloud.zIndex
    }
  })

  // Enhanced cloud design
  return (
    <AnimatedView style={animatedStyle}>
      <Svg width={cloud.width} height={cloud.height} viewBox="0 0 100 50">
        <Defs>
          <RadialGradient id={`cloudGradient${cloud.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="white" stopOpacity={cloud.opacity + 0.1} />
            <Stop offset="100%" stopColor="white" stopOpacity={cloud.opacity - 0.1} />
          </RadialGradient>
        </Defs>
        {/* More complex, natural cloud shape */}
        <Ellipse cx="30" cy="25" rx="25" ry="18" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="55" cy="20" rx="28" ry="19" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="75" cy="25" rx="20" ry="15" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="45" cy="30" rx="30" ry="18" fill={`url(#cloudGradient${cloud.id})`} />
      </Svg>
    </AnimatedView>
  )
}

// Improved Balloon Component with vertical bobbing - FIXED looping to prevent on-screen spawning
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

  // Enhanced balloon design with improved connections and no cut-off top
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

        {/* Strings - diagonal connections */}
        <Line x1="12" y1="42" x2="14" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="20" y1="44" x2="20" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="28" y1="42" x2="26" y2="56" stroke="#888" strokeWidth="0.7" />

        {/* Basket */}
        <Rect x="12" y="56" width="16" height="10" rx="2" fill={`url(#basketGradient${balloon.id})`} />
        <Rect x="13" y="56" width="14" height="2" rx="1" fill="#D2B48C" />

        {/* Basket top edge connections */}
        <Circle cx="14" cy="56" r="0.6" fill="#888" />
        <Circle cx="20" cy="56" r="0.6" fill="#888" />
        <Circle cx="26" cy="56" r="0.6" fill="#888" />
      </Svg>
    </AnimatedView>
  )
}

// Enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  skyBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  horizonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.15
  }
})
