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
}

export const PragmaDrawing = ({ size, x, y, pose, opacity }: PragmaProps) => {
  const svg = useSVG(PRAGMA_POSES[pose])
  const src = useMemo(
    () => rect(0, 0, svg?.width() ?? 0, svg?.height() ?? 0),
    [svg]
  )
  const dst = useMemo(() => rect(0, 0, size.width, size.height), [size])
  return (
    <Group transform={fitbox("contain", src, dst)} opacity={opacity}>
      <ImageSVG svg={svg} width={size.width} height={size.height} x={x} y={y} />
    </Group>
  )
}
