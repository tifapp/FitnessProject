import React, { useEffect } from "react"
import { Dimensions, Image, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated"
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg"

import FloatingIsland from "../../assets/floating10.png"

// Create animated versions of SVG components
const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse)
const AnimatedImage = Animated.createAnimatedComponent(Image)

const { width, height } = Dimensions.get("window")

// SPLIT INTO TWO COMPONENTS: Background (with clouds) and Foreground (with balloons)
export const BackgroundSVG = () => {
  // Animation shared values for cloud movement
  const cloudLayer1Position = useSharedValue(0)
  const cloudLayer2Position = useSharedValue(0)
  const cloudLayer3Position = useSharedValue(0)

  useEffect(() => {
    // Animate clouds with different speeds - much slower for a subtle effect
    // Top layer - moves fastest but still slow
    cloudLayer1Position.value = withRepeat(
      withTiming(1, { duration: 240000, easing: Easing.linear }),
      -1, // Infinite repetition
      true // Reverse animation
    )

    // Middle layer - medium speed
    cloudLayer2Position.value = withRepeat(
      withTiming(1, { duration: 320000, easing: Easing.linear }),
      -1,
      true
    )

    // Bottom layer - slowest
    cloudLayer3Position.value = withRepeat(
      withTiming(1, { duration: 400000, easing: Easing.linear }),
      -1,
      true
    )
  }, [])

  // Create animated G components
  const AnimatedG = Animated.createAnimatedComponent(G)

  // Create animated styles for each cloud layer
  const layer1AnimatedProps = useAnimatedProps(() => ({
    transform: [{
 translateX: interpolate(
      cloudLayer1Position.value,
      [0, 1],
      [0, 10],
      Extrapolation.CLAMP
    )
}]
  }))

  const layer2AnimatedProps = useAnimatedProps(() => ({
    transform: [{
 translateX: interpolate(
      cloudLayer2Position.value,
      [0, 1],
      [0, -7],
      Extrapolation.CLAMP
    )
}]
  }))

  const layer3AnimatedProps = useAnimatedProps(() => ({
    transform: [{
 translateX: interpolate(
      cloudLayer3Position.value,
      [0, 1],
      [0, 5],
      Extrapolation.CLAMP
    )
}]
  }))

  return (
    <Svg style={styles.fullSize} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {/* Definitions for gradients and patterns */}
      <Defs>
        {/* Modified gradient for sunrise */}
        <LinearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#1a237e" stopOpacity="1" />
          <Stop offset="30%" stopColor="#3949ab" stopOpacity="1" />
          <Stop offset="60%" stopColor="#ff9e80" stopOpacity="1" />
          <Stop offset="80%" stopColor="#ffab91" stopOpacity="1" />
          <Stop offset="100%" stopColor="#ff5722" stopOpacity="0.8" />
        </LinearGradient>

        <LinearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#1a2a6c" stopOpacity="0.9" />
        </LinearGradient>

        {/* Modified sun glow for sunrise */}
        <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <Stop offset="0%" stopColor="#ffeb3b" stopOpacity="1" />
          <Stop offset="50%" stopColor="#ff9800" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
        </RadialGradient>

        {/* Mist/fog gradient with sunrise tint */}
        <LinearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#ffccbc" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#ffccbc" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Background sky - using the gradient defined in Defs */}
      <Rect x="0" y="0" width="100" height="100" fill="url(#skyGradient)" />

      {/* Cloud cover with sunrise colors - now animated */}
      {/* Layer 1 - Highest clouds with sunrise color */}
      <AnimatedG opacity="0.9" animatedProps={layer1AnimatedProps}>
        <Ellipse cx="10" cy="10" rx="12" ry="3" fill="#ffccbc" />
        <Ellipse cx="14" cy="8" rx="10" ry="4" fill="#ffccbc" />
        <Ellipse cx="5" cy="8" rx="8" ry="3" fill="#ffccbc" />

        <Ellipse cx="40" cy="5" rx="15" ry="4" fill="#ffccbc" />
        <Ellipse cx="48" cy="3" rx="10" ry="3" fill="#ffccbc" />
        <Ellipse cx="35" cy="2" rx="12" ry="4" fill="#ffccbc" />

        <Ellipse cx="70" cy="8" rx="18" ry="5" fill="#ffccbc" />
        <Ellipse cx="80" cy="6" rx="12" ry="3" fill="#ffccbc" />
        <Ellipse cx="65" cy="4" rx="10" ry="4" fill="#ffccbc" />

        <Ellipse cx="95" cy="12" rx="10" ry="3" fill="#ffccbc" />
        <Ellipse cx="90" cy="10" rx="8" ry="3" fill="#ffccbc" />
      </AnimatedG>

      {/* Layer 2 - Mid-level clouds with more intense color */}
      <AnimatedG opacity="0.7" animatedProps={layer2AnimatedProps}>
        <Ellipse cx="20" cy="15" rx="10" ry="3" fill="#ffab91" />
        <Ellipse cx="25" cy="13" rx="8" ry="2" fill="#ffab91" />
        <Ellipse cx="15" cy="12" rx="7" ry="2.5" fill="#ffab91" />

        <Ellipse cx="55" cy="18" rx="12" ry="3" fill="#ffab91" />
        <Ellipse cx="60" cy="16" rx="10" ry="4" fill="#ffab91" />
        <Ellipse cx="50" cy="15" rx="9" ry="3" fill="#ffab91" />

        <Ellipse cx="85" cy="20" rx="8" ry="2" fill="#ffab91" />
        <Ellipse cx="90" cy="18" rx="6" ry="3" fill="#ffab91" />
      </AnimatedG>

      {/* Layer 3 - Lower clouds with more intense color */}
      <AnimatedG opacity="0.5" animatedProps={layer3AnimatedProps}>
        <Ellipse cx="15" cy="22" rx="8" ry="2" fill="#ff8a65" />
        <Ellipse cx="10" cy="20" rx="6" ry="2" fill="#ff8a65" />

        <Ellipse cx="45" cy="25" rx="10" ry="3" fill="#ff8a65" />
        <Ellipse cx="40" cy="23" rx="8" ry="2" fill="#ff8a65" />

        <Ellipse cx="75" cy="24" rx="12" ry="3" fill="#ff8a65" />
        <Ellipse cx="80" cy="22" rx="9" ry="2" fill="#ff8a65" />
        <Ellipse cx="70" cy="21" rx="7" ry="2.5" fill="#ff8a65" />
      </AnimatedG>

      {/* Atmospheric fog layer with sunrise color */}
      <Rect x="0" y="30" width="100" height="20" fill="url(#fogGradient)" opacity="0.4" />
    </Svg>
  )
}

export const FogCloudsSVG = () => {
  // Create separate shared values for movement and opacity
  const moveProgress = useSharedValue(0)
  const opacityProgress = useSharedValue(0)

  useEffect(() => {
    // Start movement immediately and make it much slower (20 seconds)
    moveProgress.value = withTiming(1, {
      duration: 15000,
      easing: Easing.inOut(Easing.cubic)
    })

    // Start opacity fade after movement has begun (4 second delay)
    // and make it slower too (15 seconds)
    const opacityDelay = setTimeout(() => {
      opacityProgress.value = withTiming(1, {
        duration: 10000,
        easing: Easing.inOut(Easing.cubic)
      })
    }, 1500)

    return () => clearTimeout(opacityDelay)
  }, [])

  // Create an array of fog cloud positions and animation directions
  // Each cloud will have a different movement pattern, but more subtle
  // Reduced movement amounts for a more gradual effect
  const fogClouds = [
    {
      cx: 50,
cy: 60,
rx: 38,
ry: 15,
fill: "#ffccbc",
      moveX: -10,
moveY: -5 // Move up and left
    },
    {
      cx: 25,
cy: 70,
rx: 30,
ry: 18,
fill: "#ffccbc",
      moveX: -15,
moveY: -8 // Move left and slightly up
    },
    {
      cx: 65,
cy: 75,
rx: 30,
ry: 16,
fill: "#ffccbc",
      moveX: 12,
moveY: -6 // Move right and up
    },
    {
      cx: 50,
cy: 100,
rx: 45,
ry: 20,
fill: "#ffab91",
      moveX: -7,
moveY: -3 // Move left and slightly up
    },
    {
      cx: 30,
cy: 120,
rx: 38,
ry: 22,
fill: "#ffab91",
      moveX: -16,
moveY: 0 // Move left
    },
    {
      cx: 80,
cy: 140,
rx: 35,
ry: 20,
fill: "#ffab91",
      moveX: 15,
moveY: -5 // Move right and slightly up
    },
    {
      cx: 40,
cy: 170,
rx: 40,
ry: 22,
fill: "#ffe0b2",
      moveX: 5,
moveY: -2 // Move straight up
    }
  ]

  // Create the main container style with opacity animation
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        opacityProgress.value,
        [0, 0.6, 1], // Make opacity last longer before fully disappearing
        [1, 0.4, 0],
        Extrapolation.CLAMP
      )
    }
  })

  return (
    <Animated.View style={[styles.fullSize, containerStyle, { zIndex: 10 }]}>
      <AnimatedSvg width="100%" height="100%" viewBox="0 0 100 300" preserveAspectRatio="xMidYMid slice">
        {fogClouds.map((cloud, index) => {
          // Create an animated props object for each cloud
          const animatedProps = useAnimatedProps(() => {
            // Different clouds start moving at slightly different times, but more subtle differences
            const delay = index * 0.05
            const adjustedProgress = interpolate(
              moveProgress.value,
              [delay, 1],
              [0, 1],
              Extrapolation.CLAMP
            )

            // Make movement more gradual - clouds move less at the beginning
            // and accelerate slightly toward the end
            const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
            const movementCurve = easeOutCubic(adjustedProgress)

            return {
              cx: cloud.cx + cloud.moveX * movementCurve,
              cy: cloud.cy + cloud.moveY * movementCurve,
              // More subtle stretching of clouds as they move
              rx: cloud.rx * (1 + adjustedProgress * 0.15),
              ry: cloud.ry * (1 - adjustedProgress * 0.1)
            }
          })

          return (
            <AnimatedEllipse
              key={index}
              animatedProps={animatedProps}
              fill={cloud.fill}
            />
          )
        })}
      </AnimatedSvg>
    </Animated.View>
  )
}

export const FloatingIslandComponent = () => {
  // Shared value for the island's slight floating animation
  const floatOffset = useSharedValue(0)

  useEffect(() => {
    // Create a gentle floating animation
    floatOffset.value = withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) })
  }, [])

  // Create animated style for the subtle float
  const animatedStyle = useAnimatedStyle(() => {
    const yOffset = interpolate(
      floatOffset.value,
      [0, 0.5, 1],
      [0, 2, 0],
      Extrapolation.CLAMP
    )

    return {
      transform: [
        { translateY: yOffset },
        { scaleY: 1.5 }
      ]
    }
  })

  return (
    <>
      <AnimatedImage
        style={[styles.floatingIsland, animatedStyle]}
        source={FloatingIsland}
        resizeMode="contain"
      />
      <AnimatedImage
        style={[styles.floatingIsland, styles.silhouette, animatedStyle]}
        source={FloatingIsland}
        resizeMode="contain"
      />
    </>
  )
}

export const FogOverlookWallpaper = () => {
  return (
    <View style={styles.container}>
      {/* Background with clouds */}
      <BackgroundSVG />

      {/* Floating island in the middle layer */}
      <FloatingIslandComponent />

      {/* Add the fog clouds that cover the island */}
      <FogCloudsSVG />

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
    width: 400,
    height: 400,
    top: 150,
    alignSelf: "center",
    zIndex: 0
  },
  silhouette: {
    tintColor: "#ff8a65", // Changed to orange/peach tint for sunrise
    opacity: 0.3
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
