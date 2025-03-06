import {
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  SkSize,
  vec
} from "@shopify/react-native-skia"
import { useEffect } from "react"
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { EdgeInsets } from "react-native-safe-area-context"
import {
  CORE_RADIUS,
  FADE_RING_RADIUS,
  FADE_RING_TARGET_RADIUS,
  OUTER_RING_RADIUS,
  Sun,
  SunGradient,
  SunProps
} from "./SunBackground"

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

export const MoonDrawing = ({ background, size, edgeInsets }: SunProps) => {
  const sunX = size.width * 0.5
  const sunY = Sun.absoluteYPosition(background.time, size, edgeInsets)
  const ringRadius = useSharedValue(FADE_RING_RADIUS)
  const ringOpacity = useSharedValue(0)
  const moonGlowRadius = useSharedValue(FADE_RING_RADIUS)

  useEffect(() => {
    moonGlowRadius.value = withRepeat(
      withTiming(FADE_RING_TARGET_RADIUS + 20, {
        duration: 5000,
        easing: Easing.inOut(Easing.sin)
      }),
      -1,
      true
    )
  }, [ringRadius, ringOpacity, moonGlowRadius])

  return (
    <Group>
      {/* Animated moonlight ring */}
      <Circle cx={sunX} cy={sunY} r={moonGlowRadius}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={FADE_RING_TARGET_RADIUS + 20}
          colors={Moon.gradients.ring}
          positions={[0.4, 0.6, 0.8, 1]}
        />
      </Circle>

      {/* Static moon glow */}
      <Circle cx={sunX} cy={sunY} r={OUTER_RING_RADIUS + 16}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={OUTER_RING_RADIUS + 16}
          colors={Moon.gradients.glow}
          positions={[0.3, 0.5, 0.7, 1]}
        />
      </Circle>

      {/* Main moon body */}
      <Circle cx={sunX} cy={sunY} r={CORE_RADIUS}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={CORE_RADIUS}
          colors={Moon.gradients.base}
          positions={[0.4, 0.6, 0.8, 1]}
        />
      </Circle>

      {/* Crater details */}
      <Circle cx={sunX - 15} cy={sunY - 10} r={8} color="#E0E0E0" />
      <Circle cx={sunX + 10} cy={sunY + 15} r={12} color="#EBEBEB" />
      <Circle cx={sunX + 18} cy={sunY - 12} r={6} color="#E5E5E5" />
    </Group>
  )
}
