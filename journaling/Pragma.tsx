import {
  AnimatedProp,
  Group,
  ImageSVG,
  SkSize,
  fitbox,
  rect,
  useSVG
} from "@shopify/react-native-skia"
import { useMemo } from "react"
import { SharedValue, useDerivedValue } from "react-native-reanimated"

export const PRAGMA_POSES = {
  normal: require("../assets/Pragma.svg"),
  worship: require("../assets/PragmaWorship.svg"),
  standing: require("../assets/PragmaStanding.svg")
} as const

export type PragmaPose = keyof typeof PRAGMA_POSES

export type PragmaProps = {
  size: SkSize
  pose: PragmaPose
  opacity?: AnimatedProp<number>
  x?: AnimatedProp<number>
  y?: AnimatedProp<number>
  rotation?: SharedValue<0 | 90 | 180 | 270>
}

export const PragmaDrawing = ({
  size,
  x,
  y,
  pose,
  opacity,
  rotation
}: PragmaProps) => {
  const svg = useSVG(PRAGMA_POSES[pose])
  const src = useMemo(
    () => rect(0, 0, svg?.width() ?? 0, svg?.height() ?? 0),
    [svg]
  )
  const dst = useMemo(() => rect(0, 0, size.width, size.height), [size])
  return (
    <Group
      transform={useDerivedValue(() => {
        return fitbox("contain", src, dst, rotation?.value ?? 0)
      })}
      opacity={opacity}
    >
      <ImageSVG svg={svg} width={size.width} height={size.height} x={x} y={y} />
    </Group>
  )
}
