import {
  Group,
  Rect,
  vec,
  Circle,
  LinearGradient,
  SkSize
} from "@shopify/react-native-skia"
import { useEffect, useMemo } from "react"
import {
  SharedValue,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated"

export type Star = {
  x: number
  y: number
  baseRadius: number
  amplitude: number
  speed: number
  phase: number
}

export type StarrySkyProps = {
  size: SkSize
  numStars: number
}

const MIN_DISTANCE = 12
const TOP_CUTOFF = 0.75
const UPPER_PORTION_RATIO = 0.8

export const StarrySkyDrawing = ({ size, numStars }: StarrySkyProps) => {
  const stars = useMemo<Star[]>(() => {
    const placedStars: Star[] = []

    let attempts = 0
    while (placedStars.length < numStars && attempts < numStars * 50) {
      const topPick = Math.random() < UPPER_PORTION_RATIO
      const yRange = topPick ? size.height * TOP_CUTOFF : size.height
      const xCandidate = Math.random() * size.width
      const yCandidate = Math.random() * yRange
      let tooClose = false
      for (const s of placedStars) {
        const dx = s.x - xCandidate
        const dy = s.y - yCandidate
        if (dx * dx + dy * dy < MIN_DISTANCE * MIN_DISTANCE) {
          tooClose = true
          break
        }
      }

      if (!tooClose) {
        const baseRadius = 1 + Math.random() * 2
        const amplitude = 0.3 + Math.random() * 0.5
        const speed = 1 + Math.random() * 2
        const phase = Math.random() * 2 * Math.PI

        placedStars.push({
          x: xCandidate,
          y: yCandidate,
          baseRadius,
          amplitude,
          speed,
          phase
        })
      }
      attempts++
    }

    return placedStars
  }, [size.width, size.height, numStars])

  const time = useSharedValue(0)
  useEffect(() => {
    const intervalId = setInterval(() => {
      time.value += 16
    }, 16)
    return () => clearInterval(intervalId)
  }, [time])

  return (
    <Group>
      <Rect width={size.width} height={size.height}>
        <LinearGradient
          colors={["#070D46", "#560FAC"]}
          positions={[0.3, 1]}
          start={vec(size.width / 2, 0)}
          end={vec(size.width / 2, size.height)}
        />
        {stars.map((star, idx) => (
          <StarDrawing key={`star-${idx}`} star={star} time={time} />
        ))}
      </Rect>
    </Group>
  )
}

const StarDrawing = ({
  star,
  time
}: {
  star: Star
  time: SharedValue<number>
}) => {
  const radius = useDerivedValue(() => {
    const t = time.value / 1000
    return (
      star.baseRadius + star.amplitude * Math.sin(star.speed * t + star.phase)
    )
  }, [time])

  return <Circle cx={star.x} cy={star.y} r={radius} color="white" />
}
