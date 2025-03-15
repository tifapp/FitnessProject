import { Circle, Group, SkSize } from "@shopify/react-native-skia"
import React, { useEffect } from "react"
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { uuidString } from "TiFShared/lib/UUID"

export type Cloud = {
  id: string
  relativeX: number
  relativeY: number
  relativeRangeX: number
  scale: number
  speed: number
}

export const cloud = (values: Omit<Cloud, "id">) => {
  const id = uuidString()
  return { ...values, id }
}

export type CloudProps = {
  cloud: Cloud
  size: SkSize
  hasReversedMovement: boolean
}

/**
 * A single cloud made of overlapping circles,
 * animated to move from right to left.
 */
export const CloudDrawing = ({
  size,
  cloud,
  hasReversedMovement
}: CloudProps) => {
  const end = hasReversedMovement ? 0 : 1
  const start = hasReversedMovement ? 1 : 0
  const progress = useSharedValue(start)
  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(end, { duration: cloud.speed }),
        withTiming(start, { duration: cloud.speed })
      ),
      Infinity,
      true
    )
  }, [progress, cloud.speed, end, start])
  const transform = useDerivedValue(() => {
    const baseX = size.width * cloud.relativeX
    const range = size.width * cloud.relativeRangeX
    const end = baseX + range
    const x = baseX + progress.value * (end - baseX)
    return [
      { translateX: x },
      { translateY: size.height * cloud.relativeY },
      { scale: cloud.scale }
    ]
  }, [progress, cloud, size])
  return (
    <Group transform={transform}>
      <Circle cx={30} cy={15} r={30} color="white" />
      <Circle cx={80} cy={15} r={40} color="white" />
      <Circle cx={130} cy={15} r={30} color="white" />
    </Group>
  )
}

export type MovingCloudsProps = {
  size: SkSize
  clouds: Cloud[]
}

/**
 * Renders multiple clouds at varying scales/heights,
 * so smaller/higher clouds appear “farther” away.
 */
export const MovingCloudsDrawing = ({ size, clouds }: MovingCloudsProps) => (
  <Group>
    {clouds.map((c, i) => (
      <CloudDrawing
        key={c.id}
        hasReversedMovement={i % 2 === 0}
        size={size}
        cloud={c}
      />
    ))}
  </Group>
)
