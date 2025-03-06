import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet"
import {
  Group,
  Rect,
  vec,
  Circle,
  LinearGradient
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
  width: number
  height: number
  numStars: number
  // You can add other props, e.g. starColor, minimalDistance, etc.
}

export const StarrySkyDrawing = ({
  width,
  height,
  numStars
}: StarrySkyProps) => {
  // Simple "Poisson-like" sampling with a minimum distance to reduce clumping
  const MIN_DISTANCE = 12 // minimal spacing between stars (tweak to taste)
  const TOP_CUTOFF = 0.75 // top portion fraction (75%)

  // Helps to concentrate ~80% of stars in the upper portion
  const UPPER_PORTION_RATIO = 0.8

  // Precompute star data
  const stars = useMemo<Star[]>(() => {
    const placedStars: Star[] = []

    let attempts = 0
    while (placedStars.length < numStars && attempts < numStars * 50) {
      // Weighted random for y: 80% chance to put in top 75%, 20% chance anywhere
      const topPick = Math.random() < UPPER_PORTION_RATIO

      // if topPick is true, sample y from [0, height * TOP_CUTOFF], otherwise anywhere
      const yRange = topPick ? height * TOP_CUTOFF : height
      const xCandidate = Math.random() * width
      const yCandidate = Math.random() * yRange

      // Check distance from existing stars to get a "blue noise" effect
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
        // Random base radius and twinkling parameters
        const baseRadius = 1 + Math.random() * 2
        const amplitude = 0.3 + Math.random() * 0.5 // how much the star radius "pulses"
        const speed = 1 + Math.random() * 2 // how fast the star twinkles
        const phase = Math.random() * 2 * Math.PI // random offset

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
  }, [width, height, numStars])

  const time = useSharedValue(0)
  useEffect(() => {
    const intervalId = setInterval(() => {
      time.value += 16
    }, 16)
    return () => clearInterval(intervalId)
  }, [time])

  return (
    <Group>
      <Rect width={width} height={height}>
        <LinearGradient
          colors={["#070D46", "#560FAC"]}
          positions={[0.3, 1]}
          start={vec(width / 2, 0)}
          end={vec(width / 2, height)}
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
  // We'll treat time.value as "milliseconds" and convert to seconds in our sine wave.
  // Each star will have a slightly different base radius, speed, phase, and amplitude.
  const radius = useDerivedValue(() => {
    const t = time.value / 1000 // time in seconds
    return (
      star.baseRadius + star.amplitude * Math.sin(star.speed * t + star.phase)
    )
  }, [time])

  return <Circle cx={star.x} cy={star.y} r={radius} color="white" />
}
