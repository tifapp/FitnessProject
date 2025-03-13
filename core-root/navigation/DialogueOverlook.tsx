import React, { useEffect } from "react"
import { Dimensions, Image, StyleSheet, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
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
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg"

// Import selected floating island assets
import FloatingIsland1 from "../../assets/floating1.png"
import FloatingIsland10 from "../../assets/floating10.png"
import FloatingIsland5 from "../../assets/floating5.png"
import FloatingIsland7 from "../../assets/floating7.png"

// Create animated versions of the SVG components
const AnimatedG = Animated.createAnimatedComponent(G)
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse)
const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedImage = Animated.createAnimatedComponent(Image)

const { width, height } = Dimensions.get("window")

// LargeBalloon component with fixed connections and no cut-off top
const LargeBalloon = () => {
  // Animation values for the large balloon
  const translateX = useSharedValue(width * 0.5) // Start off-screen to the right
  const translateY = useSharedValue(height * 0.8) // Start near the bottom
  const translateYFloat = useSharedValue(0) // For the floating effect

  // Balloon design parameters
  const balloonSize = 5.0 // Very large balloon
  const balloonWidth = 140 * balloonSize
  const balloonHeight = 180 * balloonSize
  const color1 = "#FF6B6B" // Vibrant red
  const color2 = "#FFC6FF" // Light purple

  useEffect(() => {
    // Initial entrance animation - move from bottom right to position
    translateX.value = withTiming(width * -0.2, {
      duration: 10000,
      easing: Easing.out(Easing.cubic)
    })

    translateY.value = withTiming(height * 0, {
      duration: 10000,
      easing: Easing.out(Easing.cubic)
    })

    // Add floating animation after balloon is in position
    setTimeout(() => {
      translateYFloat.value = withRepeat(
        withSequence(
          withTiming(-30, { // Float up with larger movement for the bigger balloon
            duration: 7000,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(0, { // Float down
            duration: 7000,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    }, 10000) // Start floating after entrance animation

    return () => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      cancelAnimation(translateYFloat)
    }
  }, [])

  // Combine animations for the balloon
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + translateYFloat.value }
      ],
      position: "absolute",
      zIndex: 4 // In front of other balloons but behind basket (which is 100+)
    }
  })

  return (
    <AnimatedView style={animatedStyle}>
      <Svg
        width={balloonWidth}
        height={balloonHeight}
        viewBox="0 0 40 70"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id="balloonGradientLarge" cx="0.5" cy="0.4" r="0.5" fx="0.3" fy="0.2">
            <Stop offset="0%" stopColor={color2} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color1} stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id="basketGradientLarge" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#balloonGradientLarge)"
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

        {/* Strings - diagonal connections */}
        <Line x1="12" y1="42" x2="14" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="20" y1="44" x2="20" y2="56" stroke="#888" strokeWidth="0.7" />
        <Line x1="28" y1="42" x2="26" y2="56" stroke="#888" strokeWidth="0.7" />

        {/* Basket */}
        <Rect x="12" y="56" width="16" height="10" rx="2" fill="url(#basketGradientLarge)" />
        <Rect x="13" y="56" width="14" height="2" rx="1" fill="#D2B48C" />

        {/* Basket top edge connections */}
        <Circle cx="14" cy="56" r="0.6" fill="#888" />
        <Circle cx="20" cy="56" r="0.6" fill="#888" />
        <Circle cx="26" cy="56" r="0.6" fill="#888" />
      </Svg>
    </AnimatedView>
  )
}

export const HotAirBalloon = ({
  x,
  y,
  size = "medium",
  color = "#f44336",
  highlightColor = "#ff8a80",
  opacity = 1.0,
  showHighlight = false,
  animationOffset = 0
}) => {
  // Animation value for the floating effect
  const floatOffset = useSharedValue(0)

  // Size mappings for different balloon parts
  const sizes = {
    tiny: {
      balloonRx: 2,
      balloonRy: 2.25,
      basketWidth: 1,
      basketHeight: 0.7,
      ropeLength: 2,
      strokeWidth: 0.1,
      highlightRx: 1.7,
      highlightRy: 2,
      floatAmount: 0.15, // Very small vertical movement for tiny balloons
      horizontalDrift: true // Tiny balloons drift horizontally
    },
    medium: {
      balloonRx: 4.6,
      balloonRy: 4.8,
      basketWidth: 1.8,
      basketHeight: 1.1,
      ropeLength: 3.2,
      strokeWidth: 0.15,
      highlightRx: 2.8,
      highlightRy: 3,
      floatAmount: 0.6,
      horizontalDrift: false
    },
    large: {
      balloonRx: 6.0,
      balloonRy: 6.5,
      basketWidth: 2.4,
      basketHeight: 1.5,
      ropeLength: 4,
      strokeWidth: 0.2,
      highlightRx: 4.2,
      highlightRy: 4.3,
      floatAmount: 1.2, // Much larger movement for foreground balloons
      horizontalDrift: false
    }
  }

  // Get the correct size settings
  const sizeProps = sizes[size] || sizes.medium

  // Add horizontal drift for tiny balloons
  const horizontalOffset = useSharedValue(0)

  useEffect(() => {
    // Start the floating animation with a delay based on the offset
    floatOffset.value = withDelay(
      animationOffset * 1000,
      withRepeat(
        withSequence(
          withTiming(sizeProps.floatAmount, {
            duration: 3000 + Math.random() * 2000, // Longer duration for more gradual movement
            easing: Easing.inOut(Easing.quad)
          }),
          withTiming(-sizeProps.floatAmount, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.quad)
          })
        ),
        -1, // Infinite repetition
        true // Reverse the animation
      )
    )

    // Only add horizontal drift for tiny balloons
    if (sizeProps.horizontalDrift) {
      // Slow drift to the left for tiny balloons
      horizontalOffset.value = withDelay(
        animationOffset * 500,
        withRepeat(
          withTiming(-2, { // Drift to the left by 2 units
            duration: 15000 + Math.random() * 5000, // Very slow drift
            easing: Easing.inOut(Easing.cubic)
          }),
          -1, // Infinite repetition
          false // Don't reverse - consistent leftward movement
        )
      )
    }

    return () => {
      cancelAnimation(floatOffset)
      cancelAnimation(horizontalOffset)
    }
  }, [])

  // Create animated style for the balloon
  const animatedProps = useAnimatedProps(() => {
    return {
      transform: sizeProps.horizontalDrift
        ? [
            { translateY: floatOffset.value },
            { translateX: horizontalOffset.value }
          ]
        : [{ translateY: floatOffset.value }]
    }
  })

  // Calculate basket position (centered below balloon)
  const basketX = x - (sizeProps.basketWidth / 2)
  const basketY = y + sizeProps.balloonRy

  return (
    <AnimatedG opacity={opacity} animatedProps={animatedProps}>
      {/* Main balloon */}
      <Ellipse
        cx={x}
        cy={y}
        rx={sizeProps.balloonRx}
        ry={sizeProps.balloonRy}
        fill={color}
      />

      {/* Highlight on balloon (optional) */}
      {showHighlight && (
        <Ellipse
          cx={x}
          cy={y - (sizeProps.balloonRy * 0.15)}
          rx={sizeProps.highlightRx}
          ry={sizeProps.highlightRy}
          fill={highlightColor}
          opacity={0.5}
        />
      )}

      {/* Basket */}
      <Rect
        x={basketX}
        y={basketY}
        width={sizeProps.basketWidth}
        height={sizeProps.basketHeight}
        fill="#795548"
      />

      {/* Left rope */}
      <Line
        x1={basketX}
        y1={basketY}
        x2={x - sizeProps.ropeLength / 2}
        y2={y + sizeProps.balloonRy / 3}
        stroke="#000000"
        strokeWidth={sizeProps.strokeWidth}
      />

      {/* Right rope */}
      <Line
        x1={basketX + sizeProps.basketWidth}
        y1={basketY}
        x2={x + sizeProps.ropeLength / 2}
        y2={y + sizeProps.balloonRy / 3}
        stroke="#000000"
        strokeWidth={sizeProps.strokeWidth}
      />
    </AnimatedG>
  )
}

export const BackgroundSVG = () => {
  // Animation shared values for cloud movement
  const cloudLayer1Position = useSharedValue(0)
  const cloudLayer2Position = useSharedValue(0)
  const cloudLayer3Position = useSharedValue(0)

  useEffect(() => {
    // Animate clouds with different speeds
    // Top layer - moves fastest
    cloudLayer1Position.value = withRepeat(
      withTiming(-100, { duration: 120000, easing: Easing.linear }),
      -1, // Infinite repetition
      true // Reverse animation
    )

    // Middle layer - medium speed
    cloudLayer2Position.value = withRepeat(
      withTiming(-100, { duration: 180000, easing: Easing.linear }),
      -1,
      true
    )

    // Bottom layer - slowest
    cloudLayer3Position.value = withRepeat(
      withTiming(-100, { duration: 240000, easing: Easing.linear }),
      -1,
      true
    )

    return () => {
      cancelAnimation(cloudLayer1Position)
      cancelAnimation(cloudLayer2Position)
      cancelAnimation(cloudLayer3Position)
    }
  }, [])

  // Create animated styles for each cloud layer
  const animatedLayer1Props = useAnimatedProps(() => ({
    transform: [{ translateX: cloudLayer1Position.value }]
  }))

  const animatedLayer2Props = useAnimatedProps(() => ({
    transform: [{ translateX: cloudLayer2Position.value }]
  }))

  const animatedLayer3Props = useAnimatedProps(() => ({
    transform: [{ translateX: cloudLayer3Position.value }]
  }))

  return (
    <Svg style={styles.fullSize} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {/* Definitions for gradients and patterns */}
      <Defs>
        <LinearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4A90E2" stopOpacity="1" />
          <Stop offset="100%" stopColor="#81C6FF" stopOpacity="1" />
        </LinearGradient>

        <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <Stop offset="0%" stopColor="white" stopOpacity="1" />
          <Stop offset="100%" stopColor="white" stopOpacity="0" />
        </RadialGradient>

        <LinearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="white" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Background sky - using the mid-day gradient defined in Defs */}
      <Rect x="0" y="0" width="100" height="100" fill="url(#skyGradient)" />

      {/* Sun/light source - higher in the sky for mid-day */}
      <Circle cx="50" cy="20" r="8" fill="white" opacity="1.0" />
      <Circle cx="50" cy="20" r="12" fill="url(#sunGlow)" opacity="0.6" />

      {/* Cloud cover - Now using Animated G for cloud layers */}
      {/* Layer 1 - Highest clouds */}
      <AnimatedG opacity="0.9" animatedProps={animatedLayer1Props}>
        {/* Double the clouds to create seamless looping */}
        <G>
          <Ellipse cx="10" cy="10" rx="12" ry="3" fill="white" />
          <Ellipse cx="14" cy="8" rx="10" ry="4" fill="white" />
          <Ellipse cx="5" cy="8" rx="8" ry="3" fill="white" />

          <Ellipse cx="40" cy="5" rx="15" ry="4" fill="white" />
          <Ellipse cx="48" cy="3" rx="10" ry="3" fill="white" />

          <Ellipse cx="80" cy="6" rx="12" ry="3" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="10" cy="10" rx="12" ry="3" fill="white" />
          <Ellipse cx="14" cy="8" rx="10" ry="4" fill="white" />
          <Ellipse cx="5" cy="8" rx="8" ry="3" fill="white" />

          <Ellipse cx="40" cy="5" rx="15" ry="4" fill="white" />
          <Ellipse cx="48" cy="3" rx="10" ry="3" fill="white" />

          <Ellipse cx="80" cy="6" rx="12" ry="3" fill="white" />
        </G>
      </AnimatedG>

      {/* Layer 2 - Mid-level clouds */}
      <AnimatedG opacity="0.7" animatedProps={animatedLayer2Props}>
        <G>
          <Ellipse cx="20" cy="15" rx="10" ry="3" fill="white" />

          <Ellipse cx="55" cy="18" rx="12" ry="3" fill="white" />
          <Ellipse cx="60" cy="16" rx="10" ry="4" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="20" cy="15" rx="10" ry="3" fill="white" />

          <Ellipse cx="55" cy="18" rx="12" ry="3" fill="white" />
          <Ellipse cx="60" cy="16" rx="10" ry="4" fill="white" />
        </G>
      </AnimatedG>

      {/* Layer 3 - Lower clouds */}
      <AnimatedG opacity="0.5" animatedProps={animatedLayer3Props}>
        <G>
          <Ellipse cx="15" cy="22" rx="8" ry="2" fill="white" />

          <Ellipse cx="75" cy="24" rx="12" ry="3" fill="white" />
          <Ellipse cx="80" cy="22" rx="9" ry="2" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="15" cy="22" rx="8" ry="2" fill="white" />

          <Ellipse cx="75" cy="24" rx="12" ry="3" fill="white" />
          <Ellipse cx="80" cy="22" rx="9" ry="2" fill="white" />
        </G>
      </AnimatedG>

      {/* Atmospheric fog layer - lighter for mid-day */}
      <Rect x="0" y="30" width="100" height="20" fill="url(#fogGradient)" opacity="0.2" />
    </Svg>
  )
}

export const BalloonsSVG = () => {
  // Simplified set of balloons with their properties
  const balloons = [
    // Horizon balloons - tiny size
    { x: 35, y: 24, size: "tiny", color: "#a9a5f0", opacity: 0.8, animationOffset: 0.1 },
    { x: 70, y: 36, size: "tiny", color: "#ffcc80", opacity: 0.8, animationOffset: 0.2 },

    // Mid-distance balloons - medium size
    { x: 20, y: 42, size: "medium", color: "#fff59d", opacity: 1.0, animationOffset: 0.2 },
    { x: 58, y: 43, size: "medium", color: "#ffab91", opacity: 1.0, animationOffset: 0.6 },

    // Foreground balloons - largest and most vibrant
    { x: 33, y: 60, size: "large", color: "#2196f3", opacity: 1.0, showHighlight: true, highlightColor: "#90caf9", animationOffset: 0.5 },
    { x: 85, y: 56, size: "large", color: "#ff9800", opacity: 1.0, showHighlight: true, highlightColor: "#ffcc80", animationOffset: 0.9 }
  ]

  return (
    <Svg style={styles.fullSize} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {/* Render all balloons from our array */}
      {balloons.map((balloon, index) => (
        <HotAirBalloon
          key={index}
          x={balloon.x}
          y={balloon.y}
          size={balloon.size}
          color={balloon.color}
          highlightColor={balloon.highlightColor}
          opacity={balloon.opacity}
          showHighlight={balloon.showHighlight}
          animationOffset={balloon.animationOffset}
        />
      ))}
    </Svg>
  )
}

export const DialogueOverlookWallpaper = () => {
  // Simplified set of floating islands
  const floatingIslands = [
    { source: FloatingIsland1, left: "5%", top: 90, width: 120, height: 120, zIndex: 3, animationOffset: 0.7 },
    { source: FloatingIsland5, left: "38%", top: 100, width: 110, height: 110, zIndex: 3, animationOffset: 0.9 },
    { source: FloatingIsland7, left: "57%", top: 70, width: 90, height: 90, zIndex: 2, animationOffset: 0.3 },
    { source: FloatingIsland10, left: "75%", top: 110, width: 130, height: 130, zIndex: 3, animationOffset: 0.8 }
  ]

  return (
    <View style={styles.container}>
      {/* Background with clouds */}
      <BackgroundSVG />

      {/* Render floating islands */}
      {floatingIslands.map((island, index) => {
        // Create a floating animation for each island
        const floatOffset = useSharedValue(0)

        useEffect(() => {
          // Start the floating animation with a delay based on the offset
          floatOffset.value = withDelay(
            island.animationOffset * 1000,
            withRepeat(
              withSequence(
                withTiming(1, {
                  duration: 8000 + Math.random() * 4000, // Much longer duration for very gradual movement
                  easing: Easing.inOut(Easing.cubic) // Smoother easing
                }),
                withTiming(0, {
                  duration: 8000 + Math.random() * 4000,
                  easing: Easing.inOut(Easing.cubic)
                })
              ),
              -1, // Infinite repetition
              true // Reverse the animation
            )
          )

          return () => {
            cancelAnimation(floatOffset)
          }
        }, [])

        const animatedStyle = useAnimatedStyle(() => {
          // The amount of float is drastically reduced for islands
          // Make it barely perceptible to simulate distance
          const floatAmount = interpolate(
            floatOffset.value,
            [0, 1],
            [0, Math.min(1.2, 3 - island.width / 50)], // Much smaller movement, max 1.2 units
            Extrapolation.CLAMP
          )

          return {
            transform: [{ translateY: floatAmount }]
          }
        })

        return (
          <AnimatedImage
            key={index}
            style={[
              styles.floatingIsland,
              {
                left: island.left,
                top: island.top,
                width: island.width,
                height: island.height,
                zIndex: island.zIndex
              },
              animatedStyle
            ]}
            source={island.source}
            resizeMode="contain"
          />
        )
      })}

      {/* Balloons in the foreground */}
      <BalloonsSVG />

      {/* Add large balloon with entrance animation */}
      <LargeBalloon />

      {/* Balloon basket and support poles - highest z-index */}
      <View style={styles.orangeBasket} />
      <View style={styles.brownBasket} />
      <View style={styles.leftPole} />
      <View style={styles.rightPole} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height
  },
  fullSize: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  floatingIsland: {
    position: "absolute",
    alignSelf: "flex-start",
    tintColor: "#8ec5fc"
  },
  orangeBasket: {
    borderRadius: 2000,
    width: 950,
    height: 950,
    left: -250,
    top: "68%",
    backgroundColor: "orange",
    zIndex: 100,
    position: "absolute"
  },
  brownBasket: {
    borderRadius: 2000,
    width: 900,
    height: 900,
    left: -225,
    top: "70%",
    backgroundColor: "brown",
    zIndex: 101,
    position: "absolute"
  },
  leftPole: {
    borderRadius: 2000,
    width: 20,
    height: 900,
    left: "5%",
    top: -50,
    backgroundColor: "brown",
    zIndex: 101,
    position: "absolute",
    transform: [{ rotate: "5deg" }]
  },
  rightPole: {
    borderRadius: 2000,
    width: 20,
    height: 900,
    right: "5%",
    top: -50,
    backgroundColor: "brown",
    zIndex: 101,
    position: "absolute",
    transform: [{ rotate: "-5deg" }]
  }
})
