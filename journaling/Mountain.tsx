import React, { useMemo } from "react"
import {
  Path,
  LinearGradient,
  vec,
  SkSize,
  Color,
  Rect
} from "@shopify/react-native-skia"

export const MOUNTAIN_COLOR_SET = {
  sun: ["#24D12B", "#1B8B23"] as Color[],
  moon: ["#2DC6B8", "#087865"] as Color[]
} as const

export type StraightMountainDrawingProps = {
  size: SkSize
  colorSet: keyof typeof MOUNTAIN_COLOR_SET
}

export const StraightMountainDrawing = ({
  size,
  colorSet
}: StraightMountainDrawingProps) => (
  <Rect width={size.width} height={size.height} x={0} y={size.height / 2}>
    <LinearGradient
      start={vec(size.width / 2, size.height * 0.4)}
      end={vec(size.width / 2, size.height)}
      colors={MOUNTAIN_COLOR_SET[colorSet]}
    />
  </Rect>
)

export type MountainProps = {
  size: SkSize
  mountainWidthRelativeOffset?: number
  colorSet: keyof typeof MOUNTAIN_COLOR_SET
}

export const MountainDrawing = ({
  size: { width, height },
  mountainWidthRelativeOffset = 0,
  colorSet
}: MountainProps) => {
  const mountainPath = useMemo(
    () => `
    M ${-width * (0.2 + mountainWidthRelativeOffset)} ${height}
    C
      ${width * 0.1} ${height * 0.2},
      ${width * 0.9} ${height * 0.2},
      ${width * (1.2 + mountainWidthRelativeOffset)} ${height}
    Z
    `,
    [width, height, mountainWidthRelativeOffset]
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
