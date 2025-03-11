import React, { useMemo } from "react"
import { Path, LinearGradient, vec, SkSize } from "@shopify/react-native-skia"

export type MountainProps = {
  size: SkSize
}

export const MountainDrawing = ({ size: { width, height } }: MountainProps) => {
  const mountainPath = useMemo(
    () => `
    M ${-width * 0.2} ${height}
    C ${width * 0.1} ${height * 0.125}, ${width * 0.9} ${height * 0.125}, ${width * 1.2} ${height}
    Z
    `,
    [width, height]
  )
  return (
    <Path path={mountainPath}>
      <LinearGradient
        start={vec(width / 2, height * 0.4)}
        end={vec(width / 2, height * 0.8)}
        colors={["#4CAF50", "#1B5E20"]}
      />
    </Path>
  )
}
