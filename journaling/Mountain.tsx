import {
  Color,
  LinearGradient,
  Path,
  SkSize,
  vec
} from "@shopify/react-native-skia"
import React, { useMemo } from "react"

export const MOUNTAIN_COLOR_SET = {
  sun: ["#24D12B", "#1B8B23"] as Color[],
  moon: ["#A882DD", "#000000"] as Color[]
} as const

export type MountainProps = {
  size: SkSize
  colorSet: keyof typeof MOUNTAIN_COLOR_SET
}

export const MountainDrawing = ({
  size: { width, height },
  colorSet
}: MountainProps) => {
  const mountainPath = useMemo(
    () => `
    M ${-width * 0.2} ${height}
    C
      ${width * 0.1} ${height * 0.2},
      ${width * 0.9} ${height * 0.2},
      ${width * 1.2} ${height}
    Z
    `,
    [width, height]
  )
  return (
    <Path path={mountainPath}>
      <LinearGradient
        start={vec(width / 2, height * 0.4)}
        end={vec(width / 2, height)}
        colors={MOUNTAIN_COLOR_SET[colorSet]}
      />
    </Path>
  )
}
