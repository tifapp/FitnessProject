import React, { useEffect } from "react"
import { Dimensions, Image, StyleSheet, View } from "react-native"
import Animated, {
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
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg"

// Import all floating island assets
import FloatingIsland1 from "../../assets/floating1.png"
import FloatingIsland10 from "../../assets/floating10.png"
import FloatingIsland11 from "../../assets/floating11.png"
import FloatingIsland12 from "../../assets/floating12.png"
import FloatingIsland13 from "../../assets/floating13.png"
import FloatingIsland14 from "../../assets/floating14.png"
import FloatingIsland15 from "../../assets/floating15.png"
import FloatingIsland16 from "../../assets/floating16.png"
import FloatingIsland2 from "../../assets/floating2.png"
import FloatingIsland3 from "../../assets/floating3.png"
import FloatingIsland4 from "../../assets/floating4.png"
import FloatingIsland5 from "../../assets/floating5.png"
import FloatingIsland6 from "../../assets/floating6.png"
import FloatingIsland7 from "../../assets/floating7.png"
import FloatingIsland8 from "../../assets/floating8.png"

// Create animated versions of the SVG components
const AnimatedG = Animated.createAnimatedComponent(G)
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse)

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
    small: {
      balloonRx: 2.8,
      balloonRy: 3,
      basketWidth: 1.2,
      basketHeight: 0.7,
      ropeLength: 2,
      strokeWidth: 0.1,
      highlightRx: 1.7,
      highlightRy: 2,
      floatAmount: 0.25,
      horizontalDrift: false
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

const { width, height } = Dimensions.get("window")

// SPLIT INTO TWO COMPONENTS: Background (with clouds) and Foreground (with balloons)
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
          <Stop offset="0%" stopColor="#8ec5fc" stopOpacity="1" />
          <Stop offset="100%" stopColor="#e0c3fc" stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#1a2a6c" stopOpacity="0.9" />
        </LinearGradient>

        <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <Stop offset="0%" stopColor="white" stopOpacity="1" />
          <Stop offset="100%" stopColor="white" stopOpacity="0" />
        </RadialGradient>

        <LinearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="white" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Background sky - using the gradient defined in Defs */}
      <Rect x="0" y="0" width="100" height="100" fill="url(#skyGradient)" />

      {/* Sun/light source */}
      <Circle cx="75" cy="15" r="5" fill="white" opacity="0.9" />
      <Circle cx="75" cy="15" r="8" fill="url(#sunGlow)" opacity="0.6" />

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
          <Ellipse cx="35" cy="2" rx="12" ry="4" fill="white" />

          <Ellipse cx="70" cy="8" rx="18" ry="5" fill="white" />
          <Ellipse cx="80" cy="6" rx="12" ry="3" fill="white" />
          <Ellipse cx="65" cy="4" rx="10" ry="4" fill="white" />

          <Ellipse cx="95" cy="12" rx="10" ry="3" fill="white" />
          <Ellipse cx="90" cy="10" rx="8" ry="3" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="10" cy="10" rx="12" ry="3" fill="white" />
          <Ellipse cx="14" cy="8" rx="10" ry="4" fill="white" />
          <Ellipse cx="5" cy="8" rx="8" ry="3" fill="white" />

          <Ellipse cx="40" cy="5" rx="15" ry="4" fill="white" />
          <Ellipse cx="48" cy="3" rx="10" ry="3" fill="white" />
          <Ellipse cx="35" cy="2" rx="12" ry="4" fill="white" />

          <Ellipse cx="70" cy="8" rx="18" ry="5" fill="white" />
          <Ellipse cx="80" cy="6" rx="12" ry="3" fill="white" />
          <Ellipse cx="65" cy="4" rx="10" ry="4" fill="white" />

          <Ellipse cx="95" cy="12" rx="10" ry="3" fill="white" />
          <Ellipse cx="90" cy="10" rx="8" ry="3" fill="white" />
        </G>
      </AnimatedG>

      {/* Layer 2 - Mid-level clouds */}
      <AnimatedG opacity="0.7" animatedProps={animatedLayer2Props}>
        <G>
          <Ellipse cx="20" cy="15" rx="10" ry="3" fill="white" />
          <Ellipse cx="25" cy="13" rx="8" ry="2" fill="white" />
          <Ellipse cx="15" cy="12" rx="7" ry="2.5" fill="white" />

          <Ellipse cx="55" cy="18" rx="12" ry="3" fill="white" />
          <Ellipse cx="60" cy="16" rx="10" ry="4" fill="white" />
          <Ellipse cx="50" cy="15" rx="9" ry="3" fill="white" />

          <Ellipse cx="85" cy="20" rx="8" ry="2" fill="white" />
          <Ellipse cx="90" cy="18" rx="6" ry="3" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="20" cy="15" rx="10" ry="3" fill="white" />
          <Ellipse cx="25" cy="13" rx="8" ry="2" fill="white" />
          <Ellipse cx="15" cy="12" rx="7" ry="2.5" fill="white" />

          <Ellipse cx="55" cy="18" rx="12" ry="3" fill="white" />
          <Ellipse cx="60" cy="16" rx="10" ry="4" fill="white" />
          <Ellipse cx="50" cy="15" rx="9" ry="3" fill="white" />

          <Ellipse cx="85" cy="20" rx="8" ry="2" fill="white" />
          <Ellipse cx="90" cy="18" rx="6" ry="3" fill="white" />
        </G>
      </AnimatedG>

      {/* Layer 3 - Lower clouds */}
      <AnimatedG opacity="0.5" animatedProps={animatedLayer3Props}>
        <G>
          <Ellipse cx="15" cy="22" rx="8" ry="2" fill="white" />
          <Ellipse cx="10" cy="20" rx="6" ry="2" fill="white" />

          <Ellipse cx="45" cy="25" rx="10" ry="3" fill="white" />
          <Ellipse cx="40" cy="23" rx="8" ry="2" fill="white" />

          <Ellipse cx="75" cy="24" rx="12" ry="3" fill="white" />
          <Ellipse cx="80" cy="22" rx="9" ry="2" fill="white" />
          <Ellipse cx="70" cy="21" rx="7" ry="2.5" fill="white" />
        </G>
        {/* Duplicate set of clouds for seamless looping */}
        <G transform="translate(100, 0)">
          <Ellipse cx="15" cy="22" rx="8" ry="2" fill="white" />
          <Ellipse cx="10" cy="20" rx="6" ry="2" fill="white" />

          <Ellipse cx="45" cy="25" rx="10" ry="3" fill="white" />
          <Ellipse cx="40" cy="23" rx="8" ry="2" fill="white" />

          <Ellipse cx="75" cy="24" rx="12" ry="3" fill="white" />
          <Ellipse cx="80" cy="22" rx="9" ry="2" fill="white" />
          <Ellipse cx="70" cy="21" rx="7" ry="2.5" fill="white" />
        </G>
      </AnimatedG>

      {/* Atmospheric fog layer */}
      <Rect x="0" y="30" width="100" height="20" fill="url(#fogGradient)" opacity="0.3" />
    </Svg>
  )
}

export const BalloonsSVG = () => {
  // Define all balloons with their properties
  const balloons = [
    // Horizon balloons - tiniest size, less saturated colors
    { x: 35, y: 24, size: "tiny", color: "#a9a5f0", opacity: 0.8, animationOffset: 0.1 },
    { x: 49, y: 25, size: "tiny", color: "#a6d6d9", opacity: 0.8, animationOffset: 0.7 },
    { x: 58, y: 24, size: "tiny", color: "#c09af9", opacity: 0.8, animationOffset: 0.4 },
    { x: 70, y: 36, size: "tiny", color: "#ffcc80", opacity: 0.8, animationOffset: 0.2 },

    // Near horizon balloons - slightly below horizon
    { x: 32, y: 35, size: "small", color: "#ffb3ae", opacity: 0.9, animationOffset: 0.3 },
    { x: 45, y: 34, size: "small", color: "#ddb6e2", opacity: 0.9, animationOffset: 0.9 },
    { x: 63, y: 33, size: "small", color: "#a4d4ff", opacity: 0.9, animationOffset: 0.5 },

    // Mid-distance balloons - more saturated
    { x: 20, y: 42, size: "medium", color: "#fff59d", opacity: 1.0, animationOffset: 0.2 },
    { x: 38, y: 45, size: "medium", color: "#a5d6a7", opacity: 1.0, animationOffset: 0.8 },
    { x: 58, y: 43, size: "medium", color: "#ffab91", opacity: 1.0, animationOffset: 0.6 },
    { x: 78, y: 40, size: "medium", color: "#ce93d8", opacity: 1.0, animationOffset: 0.4 },

    // Foreground balloons - largest and most vibrant
    { x: 15, y: 55, size: "large", color: "#f44336", opacity: 1.0, showHighlight: true, highlightColor: "#ff8a80", animationOffset: 0.1 },
    { x: 33, y: 60, size: "large", color: "#2196f3", opacity: 1.0, showHighlight: true, highlightColor: "#90caf9", animationOffset: 0.5 },
    { x: 50, y: 58, size: "large", color: "#673ab7", opacity: 1.0, showHighlight: true, highlightColor: "#b39ddb", animationOffset: 0.3 },
    { x: 67, y: 62, size: "large", color: "#4caf50", opacity: 1.0, showHighlight: true, highlightColor: "#a5d6a7", animationOffset: 0.7 },
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

// Create animated version of Image
const AnimatedImage = Animated.createAnimatedComponent(Image)

export const OverlookWallpaper = () => {
  // Define all floating islands with their positions and sizes
  const floatingIslands = [
    { source: FloatingIsland1, left: "5%", top: 90, width: 120, height: 120, zIndex: 3, animationOffset: 0.7 },
    { source: FloatingIsland2, left: "12%", top: 40, width: 35, height: 35, zIndex: 0, animationOffset: 0.2 },
    { source: FloatingIsland3, left: "20%", top: 50, width: 80, height: 80, zIndex: 2, animationOffset: 0.5 },
    { source: FloatingIsland4, left: "30%", top: 80, width: 30, height: 30, zIndex: 0, animationOffset: 0.1 },
    { source: FloatingIsland5, left: "38%", top: 100, width: 110, height: 110, zIndex: 3, animationOffset: 0.9 },
    { source: FloatingIsland6, left: "48%", top: 60, width: 25, height: 25, zIndex: 0, animationOffset: 0.4 },
    { source: FloatingIsland7, left: "57%", top: 70, width: 90, height: 90, zIndex: 2, animationOffset: 0.3 },
    { source: FloatingIsland8, left: "65%", top: 40, width: 35, height: 35, zIndex: 0, animationOffset: 0.6 },
    { source: FloatingIsland10, left: "75%", top: 110, width: 130, height: 130, zIndex: 3, animationOffset: 0.8 },
    { source: FloatingIsland11, left: "85%", top: 45, width: 60, height: 60, zIndex: 1, animationOffset: 0.2 },
    { source: FloatingIsland12, left: "5%", top: 45, width: 55, height: 55, zIndex: 1, animationOffset: 0.5 },
    { source: FloatingIsland13, left: "28%", top: 95, width: 95, height: 95, zIndex: 2, animationOffset: 0.7 },
    { source: FloatingIsland14, left: "42%", top: 55, width: 30, height: 30, zIndex: 0, animationOffset: 0.3 },
    { source: FloatingIsland15, left: "63%", top: 65, width: 85, height: 85, zIndex: 2, animationOffset: 0.1 },
    { source: FloatingIsland16, left: "80%", top: 30, width: 40, height: 40, zIndex: 0, animationOffset: 0.4 }
  ]

  return (
    <View style={styles.container}>
      {/* Background with clouds */}
      <BackgroundSVG />

      {/* Render all floating islands */}
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

      {/* Balloon basket and support poles */}
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
    alignSelf: "flex-start", // Changed from center to allow custom horizontal positioning
    tintColor: "#8ec5fc"
  },
  silhouette: {
    tintColor: "#8ec5fc",
    opacity: 0.5
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
