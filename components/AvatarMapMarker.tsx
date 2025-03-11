import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"
import { ProfileCircleView } from "./profileImageComponents/ProfileCircle"

const TargetReticle = ({ size = 100, strokeWidth = 2, color = "#000000" }: {size: number, strokeWidth: number, color: string}) => {
  // Calculate dimensions
  const outerRadius = size / 2
  const arcLength = Math.PI / 3 // 60 degrees arc

  // Calculate SVG viewBox
  const viewBoxSize = size + strokeWidth * 2
  const center = viewBoxSize / 2

  // Create paths for the four corners
  const createArc = (startAngle: number) => {
    const x1 = center + outerRadius * Math.cos(startAngle)
    const y1 = center + outerRadius * Math.sin(startAngle)
    const x2 = center + outerRadius * Math.cos(startAngle + arcLength)
    const y2 = center + outerRadius * Math.sin(startAngle + arcLength)

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}`
  }

  // Create arcs at 45, 135, 225, and 315 degrees
  const topRightArc = createArc(Math.PI * 7 / 4)
  const bottomRightArc = createArc(Math.PI * 1 / 4)
  const bottomLeftArc = createArc(Math.PI * 3 / 4)
  const topLeftArc = createArc(Math.PI * 5 / 4)

  // Optional tiny center dot
  const centerDot = center
  const dotRadius = strokeWidth

  return (
    <View style={styles.container}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <Path
          d={topRightArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d={bottomRightArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d={bottomLeftArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d={topLeftArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Optional center dot */}
        <Circle
          cx={centerDot}
          cy={centerDot}
          r={dotRadius}
          fill={color}
        />
      </Svg>
    </View>
  )
}

export type AvatarMapMarkerProps = {
  name: string
  imageURL?: string
  children?: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const AVATAR_MARKER_SIZE = 44

/**
 * A map marker component that displays an avatar.
 */
export const AvatarMapMarkerView = ({
  name,
  imageURL,
  children,
  style
}: AvatarMapMarkerProps) => (
  <View style={[style, styles.frame]}>
    <View style={styles.container}>
      <View style={styles.markerContainer}>
        {children}
        <View style={styles.whiteBackground}>
          <TargetReticle size={150} strokeWidth={3} color="#ffffff" />
          <ProfileCircleView
            name={name}
            imageURL={imageURL}
            style={styles.imageBackground}
          />
        </View>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  frame: {
    width: 96,
    height: 64
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  whiteBackground: {
    zIndex: 1,
    width: AVATAR_MARKER_SIZE,
    height: AVATAR_MARKER_SIZE,
    backgroundColor: "white",
    borderRadius: 128,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  imageBackground: {
    width: AVATAR_MARKER_SIZE - 4,
    height: AVATAR_MARKER_SIZE - 4,
    borderRadius: 128,
    overflow: "hidden"
  },
  badgeContainer: {
    zIndex: 2,
    flex: 1,
    top: -8,
    right: -AVATAR_MARKER_SIZE / 2,
    padding: 4,
    position: "absolute",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "scroll"
  },
  badgeIcon: {
    marginLeft: 4
  },
  badgeText: {
    marginLeft: 4,
    marginRight: 4,
    color: "white"
  }
})
