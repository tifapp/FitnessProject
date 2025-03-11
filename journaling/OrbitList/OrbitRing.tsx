import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Point {
  x: number;
  y: number;
}

interface OrbitRingProps {
  rotation: number;
  orbitRadius: number;
  tiltAngle: number;
  positionX: number;
  positionY: number;
  frontStroke?: string;
  backStroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

const OrbitRing: React.FC<OrbitRingProps> = ({
  rotation,
  orbitRadius,
  tiltAngle,
  positionX,
  positionY,
  frontStroke = "rgba(180, 180, 220, 0.7)",
  backStroke = "rgba(180, 180, 220, 0.3)",
  strokeWidth = 2,
  strokeDasharray = "5,3"
}) => {
  // Convert tilt angle to radians
  const tiltRadian = (tiltAngle * Math.PI) / 180

  // Apply tilt transformation to coordinates
  const applyTilt = (x: number, y: number): Point => {
    const xOrigin = x - positionX
    const yOrigin = y - positionY

    const xRotated = xOrigin * Math.cos(tiltRadian) - yOrigin * Math.sin(tiltRadian)
    const yRotated = xOrigin * Math.sin(tiltRadian) + yOrigin * Math.cos(tiltRadian)

    return {
      x: xRotated + positionX,
      y: yRotated + positionY
    }
  }

  // Generate the paths for the front and back ring segments
  const { frontPathD, backPathD } = useMemo(() => {
    const frontPoints: Point[] = []
    const backPoints: Point[] = []

    const numPoints = 100
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI + rotation

      // Calculate base elliptical position
      const baseX = positionX + Math.cos(angle) * orbitRadius
      const baseY = positionY + Math.sin(angle) * orbitRadius * 0.4

      // Apply tilt
      const { x, y } = applyTilt(baseX, baseY)

      // Determine if this point is in front or behind based on z-value
      const z = Math.sin(angle)

      if (z >= 0) {
        frontPoints.push({ x, y })
      } else {
        backPoints.push({ x, y })
      }
    }

    // Create SVG path strings
    let frontPathD = ""
    let backPathD = ""

    if (frontPoints.length > 0) {
      frontPathD = `M ${frontPoints[0].x} ${frontPoints[0].y} `
      frontPoints.forEach((point, i) => {
        if (i > 0) frontPathD += `L ${point.x} ${point.y} `
      })
    }

    if (backPoints.length > 0) {
      backPathD = `M ${backPoints[0].x} ${backPoints[0].y} `
      backPoints.forEach((point, i) => {
        if (i > 0) backPathD += `L ${point.x} ${point.y} `
      })
    }

    return { frontPathD, backPathD }
  }, [rotation, orbitRadius, tiltRadian, positionX, positionY])

  return (
    <>
      {/* Back half of ring (behind center) */}
      <Svg style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
        <Path
          d={backPathD}
          fill="none"
          stroke={backStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      </Svg>

      {/* Front half of ring (in front of center) */}
      <Svg style={[StyleSheet.absoluteFill, { zIndex: 55 }]}>
        <Path
          d={frontPathD}
          fill="none"
          stroke={frontStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      </Svg>
    </>
  )
}

export default OrbitRing
