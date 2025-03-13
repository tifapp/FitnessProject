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

interface CloudComponentProps {
  cloud: CloudData;
}

interface UserBalloonProps {
  size: number;
  color1: string;
  color2: string;
  verticalAmount: number;
  verticalSpeed: number;
  zIndex: number;
  positionX?: number;
  positionY?: number;
  delay?: number;
  opacity?: number;
}

interface MountainData {
  id: number;
  initialLeft: number;
  height: number;
  width: number;
  speed: number;
  color: string;
  delay: number;
  zIndex: number;
}

interface MountainComponentProps {
  mountain: MountainData;
}

// Simple Mountain Component
const MountainComponent: React.FC<MountainComponentProps> = ({ mountain }) => {
  const translateX = useSharedValue(mountain.initialLeft)

  // Setup animation for mountain movement
  useEffect(() => {
    // Simple horizontal movement
    translateX.value = withDelay(
      mountain.delay,
      withRepeat(
        withTiming(-mountain.width, {
          duration: mountain.speed,
          easing: Easing.linear
        }),
        -1,
        false
      )
    )

    return () => {
      cancelAnimation(translateX)
    }
  }, [])

  // Animated style with looping
  const animatedStyle = useAnimatedStyle(() => {
    const currentPosition = translateX.value
    const isOffScreenLeft = currentPosition <= -mountain.width
    const adjustedX = isOffScreenLeft ? width : currentPosition

    return {
      transform: [{ translateX: adjustedX }],
      position: "absolute",
      bottom: 0,
      zIndex: mountain.zIndex
    }
  })

  // Simple triangle mountain shape
  return (
    <AnimatedView style={animatedStyle}>
      <Svg width={mountain.width} height={mountain.height}>
        <Path
          d={`M0,${mountain.height} L${mountain.width / 2},0 L${mountain.width},${mountain.height} Z`}
          fill={mountain.color}
        />
      </Svg>
    </AnimatedView>
  )
}

const SidewaysWallpaperDramatic: React.FC = () => {
  // Generate clouds with varying distances/speeds - UPDATED for night sky aesthetic
  const clouds: CloudData[] = [
    // Background clouds (higher, slower, more transparent)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: i,
      initialLeft: width + Math.random() * (width * 0.5),
      top: height * (0.02 + Math.random() * 0.1),
      width: 120 + Math.random() * 80,
      height: 60 + Math.random() * 40,
      speed: 35000 + Math.random() * 15000,
      opacity: 0.15 + Math.random() * 0.1, // More transparent for night
      delay: i * 1500,
      zIndex: 0,
      scale: 0.5 + Math.random() * 0.3
    })),
    // Mid-level clouds
    ...Array.from({ length: 5 }, (_, i) => ({
      id: i + 4,
      initialLeft: width + Math.random() * (width * 0.5),
      top: height * (0.1 + Math.random() * 0.15),
      width: 150 + Math.random() * 100,
      height: 70 + Math.random() * 50,
      speed: 25000 + Math.random() * 10000,
      opacity: 0.2 + Math.random() * 0.15, // More transparent for night
      delay: i * 1200,
      zIndex: 1,
      scale: 0.7 + Math.random() * 0.3
    })),
    // Foreground clouds (lower, faster, more opaque)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: i + 9,
      initialLeft: width + Math.random() * (width * 0.5),
      top: height * (0.2 + Math.random() * 0.1),
      width: 200 + Math.random() * 150,
      height: 90 + Math.random() * 60,
      speed: 20000 + Math.random() * 8000,
      opacity: 0.25 + Math.random() * 0.15, // More transparent for night
      delay: i * 1000,
      zIndex: 2,
      scale: 0.9 + Math.random() * 0.3
    }))
  ]

  // Generate mountains with different layers/speeds
  const mountains: MountainData[] = [
    // Distant mountain
    {
      id: 1,
      initialLeft: width,
      height: height * 0.15, // 15% of screen height
      width: width * 0.7, // 70% of screen width
      speed: 40000, // Slow
      color: "#121236", // Very dark blue
      delay: 0,
      zIndex: 2
    },
    // Mid-distance mountain
    {
      id: 2,
      initialLeft: width + width * 0.3,
      height: height * 0.18, // 18% of screen height
      width: width * 0.6, // 60% of screen width
      speed: 35000,
      color: "#0D0D2B", // Darker blue
      delay: 2000,
      zIndex: 3
    },
    // Foreground mountain
    {
      id: 3,
      initialLeft: width + width * 0.6,
      height: height * 0.22, // 22% of screen height
      width: width * 0.5, // 50% of screen width
      speed: 28000, // Faster
      color: "#080819", // Almost black
      delay: 4000,
      zIndex: 4
    }
  ]

  // User's main balloon properties
  const mainBalloonProps: UserBalloonProps = {
    size: 2.0,
    color1: "#B22D5D", // Dimmed pink
    color2: "#661657", // Dimmed purple
    verticalAmount: 20,
    verticalSpeed: 8000,
    zIndex: 5,
    positionX: 140,
    opacity: 1.0
  }

  // Second trailing balloon properties
  const trailingBalloonProps: UserBalloonProps = {
    size: 1.6,
    color1: "#10628F", // Dimmed blue
    color2: "#0A3F5C", // Dimmed deeper blue
    verticalAmount: 18,
    verticalSpeed: 7800,
    zIndex: 4,
    positionX: width / 2 - 125 * 1.6 / 2 - 60,
    positionY: height * 0.33,
    delay: 1000,
    opacity: 1.0
  }

  return (
    <View style={styles.container}>
      {/* Sky gradient background with stars only at top */}
      <Svg style={styles.skyBackground} width="100%" height="100%">
        <Defs>
          <LinearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#090921" stopOpacity="1" />
            <Stop offset="40%" stopColor="#191970" stopOpacity="1" />
            <Stop offset="80%" stopColor="#283593" stopOpacity="1" />
            <Stop offset="100%" stopColor="#3949AB" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#skyGradient)" />

        {/* Stars - only in top third of sky */}
        {Array.from({ length: 100 }, (_, i) => {
          const x = Math.random() * width
          const y = Math.random() * height * 0.25 // Stars only in top 25% of sky
          const size = Math.random() * 1.5 + 0.5
          const opacity = Math.random() * 0.7 + 0.3
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill="white"
              opacity={opacity}
            />
          )
        })}

        {/* Add some larger stars, also only at top */}
        {Array.from({ length: 15 }, (_, i) => {
          const x = Math.random() * width
          const y = Math.random() * height * 0.2 // Larger stars even higher in top 20%
          const size = Math.random() * 1 + 1.5
          return (
            <Circle
              key={i + 100}
              cx={x}
              cy={y}
              r={size}
              fill="white"
              opacity={0.9}
            />
          )
        })}

        {/* Add a few "twinkling" stars with animation - in future version */}
      </Svg>

      {/* Clouds sorted by z-index */}
      {clouds
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(cloud => (
          <CloudComponent key={cloud.id} cloud={cloud} />
        ))}

      {/* Mountain peaks at bottom */}
      {mountains.map(mountain => (
        <MountainComponent key={mountain.id} mountain={mountain} />
      ))}

      {/* Second trailing balloon */}
      <UserBalloon {...trailingBalloonProps} />

      {/* User's main balloon in the middle */}
      <UserBalloon {...mainBalloonProps} />

      {/* Enhanced horizon/ground layer */}
      <View style={styles.horizonContainer}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="horizonGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="rgba(25, 25, 112, 0)" stopOpacity="0" />
              <Stop offset="70%" stopColor="rgba(15, 15, 35, 0.2)" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="rgba(10, 10, 25, 0.3)" stopOpacity="0.3" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#horizonGradient)" />
        </Svg>
      </View>
    </View>
  )
}

// User's Balloon Component
const UserBalloon: React.FC<UserBalloonProps> = ({
  size,
  color1,
  color2,
  verticalAmount,
  verticalSpeed,
  zIndex,
  positionX,
  positionY,
  delay = 0,
  opacity = 1
}) => {
  const translateY = useSharedValue(0)
  const balloonWidth = 125 * size
  const balloonHeight = 175 * size

  // Position in the middle of the screen or at provided position
  const finalPositionX = positionX !== undefined ? positionX : width / 2 - balloonWidth / 2
  const finalPositionY = positionY !== undefined ? positionY : height * 0.3

  // Increased vertical amount for more apparent floating
  const enhancedVerticalAmount = verticalAmount * 1.5

  useEffect(() => {
    // Only vertical bobbing motion
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-enhancedVerticalAmount, {
            duration: verticalSpeed * 0.6,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(0, {
            duration: verticalSpeed * 0.6,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1,
        true
      )
    )

    return () => {
      cancelAnimation(translateY)
    }
  }, [])

  // Animated style for the balloon
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value }
      ],
      position: "absolute",
      left: finalPositionX,
      top: finalPositionY,
      zIndex,
      opacity
    }
  })

  // Basket colors adjusted for night scene
  const brightBasketColor = "#D89058"
  const brightBasketBorderColor = "#A55D24"
  const basketDetailColor = "#914C2C"

  // Enhanced balloon design
  return (
    <AnimatedView style={animatedStyle}>
      <Svg
        width={balloonWidth}
        height={balloonHeight}
        viewBox="0 -5 40 75"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id={`userBalloonGradient-${zIndex}`} cx="0.5" cy="0.4" r="0.5" fx="0.3" fy="0.2">
            <Stop offset="0%" stopColor={color2} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color1} stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id={`userBasketGradient-${zIndex}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={brightBasketColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={brightBasketBorderColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Solid white background behind the balloon */}
        <Ellipse
          cx="20"
          cy="22"
          rx="22"
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
          fill={`url(#userBalloonGradient-${zIndex})`}
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

        {/* Panel lines on balloon */}
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

        {/* Additional decorative lines */}
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

        {/* Basket */}
        <Rect x="12" y="56" width="16" height="10" rx="2" fill={`url(#userBasketGradient-${zIndex})`} />
        <Rect x="13" y="56" width="14" height="2" rx="1" fill={brightBasketColor} />

        {/* Basket details */}
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

// Night-time Cloud Component
const CloudComponent: React.FC<CloudComponentProps> = ({ cloud }) => {
  const translateX: SharedValue<number> = useSharedValue(cloud.initialLeft)
  const translateY: SharedValue<number> = useSharedValue(0)

  // Setup animation for cloud movement
  useEffect(() => {
    // Animation for horizontal movement
    translateX.value = withDelay(
      cloud.delay,
      withRepeat(
        withTiming(-cloud.width * 1.5, {
          duration: cloud.speed,
          easing: Easing.linear
        }),
        -1,
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
        -1,
        true
      )
    )

    return () => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
    }
  }, [])

  // Animated style for cloud with looping
  const animatedStyle = useAnimatedStyle(() => {
    const currentPosition = translateX.value
    const isOffScreenLeft = currentPosition <= -cloud.width
    const adjustedX = isOffScreenLeft
      ? width + cloud.width
      : currentPosition

    return {
      transform: [
        { translateX: adjustedX },
        { translateY: translateY.value },
        { scale: cloud.scale }
      ],
      position: "absolute",
      top: cloud.top,
      zIndex: cloud.zIndex
    }
  })

  // Night-time cloud design
  return (
    <AnimatedView style={animatedStyle}>
      <Svg width={cloud.width} height={cloud.height} viewBox="0 0 100 50">
        <Defs>
          <RadialGradient id={`cloudGradient${cloud.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#E8E8FF" stopOpacity={cloud.opacity + 0.05} />
            <Stop offset="100%" stopColor="#C0C0FF" stopOpacity={cloud.opacity - 0.05} />
          </RadialGradient>
        </Defs>
        {/* More natural night cloud shape */}
        <Ellipse cx="30" cy="25" rx="25" ry="18" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="55" cy="20" rx="28" ry="19" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="75" cy="25" rx="20" ry="15" fill={`url(#cloudGradient${cloud.id})`} />
        <Ellipse cx="45" cy="30" rx="30" ry="18" fill={`url(#cloudGradient${cloud.id})`} />
      </Svg>
    </AnimatedView>
  )
}

// Styles
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

export const SidewaysWallpaperDramaticMemo = React.memo(SidewaysWallpaperDramatic)
