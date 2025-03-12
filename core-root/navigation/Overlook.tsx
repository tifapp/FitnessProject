import React from "react"
import { Dimensions, Image, StyleSheet, View } from "react-native"
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
import FloatingIsland from "../../assets/floating10.png"

export const HotAirBalloon = ({
  x,
  y,
  size = "medium",
  color = "#f44336",
  highlightColor = "#ff8a80",
  opacity = 1.0,
  showHighlight = false
}) => {
  // Size mappings for different balloon parts
  const sizes = {
    small: {
      balloonRx: 2.8,
      balloonRy: 3,
      basketWidth: 1.2,
      basketHeight: 0.7,
      ropeLength: 2,
      strokeWidth: 0.1,
      highlightRx: 1.7,
      highlightRy: 2
    },
    medium: {
      balloonRx: 4.6,
      balloonRy: 4.8,
      basketWidth: 1.8,
      basketHeight: 1.1,
      ropeLength: 3.2,
      strokeWidth: 0.15,
      highlightRx: 2.8,
      highlightRy: 3
    },
    large: {
      balloonRx: 6.0,
      balloonRy: 6.5,
      basketWidth: 2.4,
      basketHeight: 1.5,
      ropeLength: 4,
      strokeWidth: 0.2,
      highlightRx: 4.2,
      highlightRy: 4.3
    }
  }

  // Get the correct size settings
  const sizeProps = sizes[size] || sizes.medium

  // Calculate basket position (centered below balloon)
  const basketX = x - (sizeProps.basketWidth / 2)
  const basketY = y + sizeProps.balloonRy

  return (
    <G opacity={opacity}>
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
    </G>
  )
}

const { width, height } = Dimensions.get("window")

// SPLIT INTO TWO COMPONENTS: Background (with clouds) and Foreground (with balloons)
export const BackgroundSVG = () => {
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

      {/* Cloud cover */}
      {/* Layer 1 - Highest clouds */}
      <G opacity="0.9">
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

      {/* Layer 2 - Mid-level clouds */}
      <G opacity="0.7">
        <Ellipse cx="20" cy="15" rx="10" ry="3" fill="white" />
        <Ellipse cx="25" cy="13" rx="8" ry="2" fill="white" />
        <Ellipse cx="15" cy="12" rx="7" ry="2.5" fill="white" />

        <Ellipse cx="55" cy="18" rx="12" ry="3" fill="white" />
        <Ellipse cx="60" cy="16" rx="10" ry="4" fill="white" />
        <Ellipse cx="50" cy="15" rx="9" ry="3" fill="white" />

        <Ellipse cx="85" cy="20" rx="8" ry="2" fill="white" />
        <Ellipse cx="90" cy="18" rx="6" ry="3" fill="white" />
      </G>

      {/* Layer 3 - Lower clouds */}
      <G opacity="0.5">
        <Ellipse cx="15" cy="22" rx="8" ry="2" fill="white" />
        <Ellipse cx="10" cy="20" rx="6" ry="2" fill="white" />

        <Ellipse cx="45" cy="25" rx="10" ry="3" fill="white" />
        <Ellipse cx="40" cy="23" rx="8" ry="2" fill="white" />

        <Ellipse cx="75" cy="24" rx="12" ry="3" fill="white" />
        <Ellipse cx="80" cy="22" rx="9" ry="2" fill="white" />
        <Ellipse cx="70" cy="21" rx="7" ry="2.5" fill="white" />
      </G>

      {/* Atmospheric fog layer */}
      <Rect x="0" y="30" width="100" height="20" fill="url(#fogGradient)" opacity="0.3" />
    </Svg>
  )
}

export const BalloonsSVG = () => {
  // Define all balloons with their properties
  // Define all balloons with their properties
  const balloons = [
    // Distant balloons - using lighter, desaturated colors instead of opacity
    { x: 30, y: 35, size: "small", color: "#f9a5a0", opacity: 1.0 }, // Lighter red
    { x: 55, y: 40, size: "small", color: "#d6a6d9", opacity: 1.0 }, // Lighter purple
    { x: 70, y: 33, size: "small", color: "#90caf9", opacity: 1.0 }, // Lighter blue
    { x: 63, y: 38, size: "small", color: "#ffcc80", opacity: 1.0 }, // Lighter orange

    // Middle distance balloons - slightly less saturated
    { x: 33, y: 45, size: "medium", color: "#fff59d", opacity: 1.0 }, // Lighter yellow
    { x: 42, y: 50, size: "medium", color: "#a5d6a7", opacity: 1.0 }, // Lighter green
    { x: 72, y: 47, size: "medium", color: "#ffab91", opacity: 1.0 }, // Lighter deep orange

    // Foreground balloons - vibrant, full colors
    { x: 30, y: 55, size: "large", color: "#f44336", opacity: 1.0, showHighlight: true, highlightColor: "#ff8a80" },
    { x: 62, y: 60, size: "large", color: "#2196f3", opacity: 1.0, showHighlight: true, highlightColor: "#90caf9" },
    { x: 50, y: 58, size: "large", color: "#673ab7", opacity: 1.0, showHighlight: true, highlightColor: "#b39ddb" }
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
        />
      ))}
    </Svg>
  )
}

export const OverlookWallpaper = () => {
  return (
    <View style={styles.container}>
      {/* Background with clouds */}
      <BackgroundSVG />

      {/* Floating island in the middle layer */}
      <Image
        style={styles.floatingIsland}
        source={FloatingIsland}
        resizeMode="contain"
      />
      <Image
        style={[styles.floatingIsland, styles.silhouette]}
        source={FloatingIsland}
        resizeMode="contain"
      />

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
    width: 400,
    height: 400,
    top: 100,
    alignSelf: "center",
    zIndex: 0
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
