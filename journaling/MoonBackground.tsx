import {
  Circle,
  Group,
  RadialGradient,
  SkSize
} from "@shopify/react-native-skia"
import { useEffect } from "react"
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { Sun, SunGradient, SunProps } from "./SunBackground"
import { StarrySkyDrawing } from "./StarrySky"
import { EdgeInsets } from "react-native-safe-area-context"

export namespace Moon {
  export const gradients = {
    base: ["#FFFFFF", "#F4F4F4", "#E8E8E8", "#DADADA"] as SunGradient,
    glow: [
      "rgba(56, 76, 112, 0.4)",
      "rgba(44, 59, 89, 0.2)",
      "rgba(30, 42, 66, 0.1)",
      "rgba(19, 29, 53, 0)"
    ] as SunGradient,
    ring: [
      "rgba(190, 210, 255, 0.3)",
      "rgba(150, 180, 255, 0.2)",
      "rgba(100, 140, 255, 0.1)",
      "rgba(80, 120, 255, 0)"
    ] as SunGradient
  }
}

export type MoonProps = {
  background: SunProps["background"]
  size: SkSize
  edgeInsets: EdgeInsets
}

const CORE_RADIUS = 48
const OUTER_RING_RADIUS = 56
const FADE_RING_MID_POINT_RADIUS = 72
const FADE_RING_TARGET_RADIUS = 96

export const MoonBackgroundDrawing = ({
  background,
  size,
  edgeInsets
}: MoonProps) => {
  const sunX = size.width * 0.5
  const sunY = Sun.absoluteYPosition(background.time, size, edgeInsets)
  const moonGlow = useSharedValue({
    radius: CORE_RADIUS,
    opacity: 0
  })

  useEffect(() => {
    moonGlow.value = withRepeat(
      withSequence(
        withTiming(
          { radius: FADE_RING_MID_POINT_RADIUS, opacity: 0.5 },
          { duration: 2500, easing: Easing.linear }
        ),
        withTiming(
          { radius: FADE_RING_TARGET_RADIUS, opacity: 0 },
          { duration: 2500, easing: Easing.linear }
        )
      ),
      -1
    )
  }, [moonGlow])

  return (
    <Group>
      <StarrySkyDrawing size={size} numStars={50} />
      <Circle cx={sunX} cy={sunY} r={FADE_RING_TARGET_RADIUS}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={FADE_RING_TARGET_RADIUS}
          colors={Moon.gradients.ring}
          positions={[0.4, 0.6, 0.8, 1]}
        />
      </Circle>

      <Circle
        cx={sunX}
        cy={sunY}
        r={useDerivedValue(() => moonGlow.value.radius, [moonGlow])}
        opacity={useDerivedValue(() => moonGlow.value.opacity, [moonGlow])}
      >
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={FADE_RING_TARGET_RADIUS}
          colors={Moon.gradients.ring}
          positions={[0.4, 0.6, 0.8, 1]}
        />
      </Circle>
      <Circle cx={sunX} cy={sunY} r={OUTER_RING_RADIUS + 16}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={OUTER_RING_RADIUS + 16}
          colors={Moon.gradients.glow}
          positions={[0.3, 0.5, 0.7, 1]}
        />
      </Circle>
      <Circle cx={sunX} cy={sunY} r={CORE_RADIUS}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={CORE_RADIUS}
          colors={Moon.gradients.base}
          positions={[0.4, 0.6, 0.8, 1]}
        />
      </Circle>
      <Circle cx={sunX - 15} cy={sunY - 10} r={8} color="#E0E0E0" />
      <Circle cx={sunX + 10} cy={sunY + 15} r={12} color="#EBEBEB" />
      <Circle cx={sunX + 18} cy={sunY - 12} r={6} color="#E5E5E5" />
    </Group>
  )
}
