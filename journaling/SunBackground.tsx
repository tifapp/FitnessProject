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
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { Cloud, MovingCloudsDrawing } from "./Clouds"

export type SunBackgroundColor = string

export type SunGradient = [
  SunBackgroundColor,
  SunBackgroundColor,
  SunBackgroundColor,
  SunBackgroundColor
]

export type SkyGradient = SunBackgroundColor[]

export type SunBackground = {
  time: SunBackgroundTime
  dayRange: SunBackgroundDayRange
  clouds: Cloud[]
}

export type SunBackgroundTime = number
export type SunBackgroundDayRange = FixedDateRange

const SUN_EVENT_TIME_MINUTES = 30

export namespace Sky {
  export const gradients = {
    sunrise: ["#9ADDFA", "#F57A86", "#FF7040"] as SkyGradient,
    sunset: ["#0C52BA", "#EC54B6", "#F7482E"] as SkyGradient,
    morning: ["#17D0F9", "#24B7FB", "#319EFD"] as SkyGradient,
    afternoon: ["#438AEF", "#266DCD", "#0A50AB"] as SkyGradient,
    midDay: ["#3FADFB", "#6CACFF", "#3183FD"] as SkyGradient,
    night: ["#0A1D4C", "#1A2B5C", "#0E1A3B"] as SkyGradient
  }

  export const gradientAtTime = (
    t: SunBackgroundTime,
    dayRange: SunBackgroundDayRange
  ) => {
    const sunEventTime = SUN_EVENT_TIME_MINUTES / dayRange.diff.minutes
    if (t < 0 || t > 1) return gradients.night
    if (t <= 0.2) {
      return gradients.sunrise
    } else if (t <= 0.4) {
      return gradients.morning
    } else if (t <= 0.6) {
      return gradients.midDay
    } else if (t <= 0.8) {
      return gradients.afternoon
    } else {
      return gradients.sunset
    }
  }

  export const gradientMidPoint = (
    t: SunBackgroundTime,
    size: SkSize,
    edgeInsets: EdgeInsets
  ) => {
    const pos = Sun.absoluteYPosition(t, size, edgeInsets) / size.height
    const boundPos = Sun.absoluteYPosition(0.3, size, edgeInsets) / size.height
    return Math.max(pos, boundPos)
  }
}

export namespace Sun {
  export const gradients = {
    midDay: ["#FFFCF0", "#FCF0BE", "#FAEAA5", "#F9E48C"] as SunGradient,
    sunset: ["#FEB16F", "#F59861", "#F18C5B", "#ED7F54"] as SunGradient,
    sunrise: ["#FEDA6F", "#FBBC6B", "#F9AE6A", "#F89F68"] as SunGradient
  }

  export const gradientAtTime = (
    t: SunBackgroundTime,
    dayRange: SunBackgroundDayRange
  ) => {
    const sunEventTime = SUN_EVENT_TIME_MINUTES / dayRange.diff.minutes
    if (t <= sunEventTime) {
      return gradients.sunrise
    } else if (t >= 1 - sunEventTime) {
      return gradients.sunset
    } else {
      return gradients.midDay
    }
  }

  export const relativeYPosition = (t: SunBackgroundTime) => {
    return Math.max(-0.6, -8 * Math.pow(t - 0.5, 4))
  }

  export const absoluteYPosition = (
    t: SunBackgroundTime,
    size: SkSize,
    edgeInsets: EdgeInsets
  ) => {
    const insetSize = {
      width: size.width - edgeInsets.left - edgeInsets.right,
      height: size.height - edgeInsets.top - edgeInsets.bottom
    }
    const topInsetHeightDiff = size.height - (size.height - edgeInsets.top)
    const insetAspectRatio = insetSize.width / insetSize.height
    const relativeY = relativeYPosition(t) * insetAspectRatio
    return (
      edgeInsets.top +
      FADE_RING_RADIUS / 2 +
      topInsetHeightDiff -
      insetSize.height * relativeY
    )
  }
}

export type SunBackgroundProps = {
  size: SkSize
  background: SunBackground
  edgeInsets: EdgeInsets
}

const CORE_RADIUS = 48
const OUTER_RING_RADIUS = 56
const FADE_RING_RADIUS = 64
const FADE_RING_TARGET_RADIUS = 80

export const SunBackgroundDrawing = ({
  edgeInsets,
  background,
  size
}: SunBackgroundProps) => (
  <Group>
    <Rect width={size.width} height={size.height}>
      <LinearGradient
        start={vec(size.width / 2, 0)}
        end={vec(size.width / 2, size.height)}
        colors={Sky.gradientAtTime(background.time, background.dayRange)}
        positions={[
          0,
          Sky.gradientMidPoint(background.time, size, edgeInsets),
          1
        ]}
      />
    </Rect>
    <SunDrawing background={background} size={size} edgeInsets={edgeInsets} />
    <MovingCloudsDrawing size={size} clouds={background.clouds} />
  </Group>
)

export type SunProps = {
  background: SunBackground
  size: SkSize
  edgeInsets: EdgeInsets
}

export namespace Moon {
  export const gradients = {
    base: ["#FFFFFF", "#F4F4F4", "#E8E8E8", "#DADADA"] as SunGradient,
    glow: ["rgba(56, 76, 112, 0.4)", "rgba(44, 59, 89, 0.2)", "rgba(30, 42, 66, 0.1)", "rgba(19, 29, 53, 0)"] as SunGradient,
    ring: ["rgba(190, 210, 255, 0.3)", "rgba(150, 180, 255, 0.2)", "rgba(100, 140, 255, 0.1)", "rgba(80, 120, 255, 0)"] as SunGradient
  }
}

export const SunDrawing = ({ background, size, edgeInsets }: SunProps) => {
  const sunX = size.width * 0.5
  const sunY = Sun.absoluteYPosition(background.time, size, edgeInsets)
  const ringRadius = useSharedValue(FADE_RING_RADIUS)
  const ringOpacity = useSharedValue(0)
  const moonGlowRadius = useSharedValue(FADE_RING_RADIUS)

  const isNight = background.time < 0 || background.time > 1

  useEffect(() => {
    if (isNight) {
      moonGlowRadius.value = 110
    } else {
      ringRadius.value = withRepeat(
        withTiming(FADE_RING_TARGET_RADIUS, {
          duration: 3500,
          easing: Easing.linear
        }),
        -1,
        false
      )
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000, easing: Easing.linear }),
          withTiming(0, { duration: 2500, easing: Easing.linear })
        ),
        -1,
        true
      )
    }
  }, [ringRadius, ringOpacity, moonGlowRadius, isNight])

  if (isNight) {
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
        <Circle
          cx={sunX - 15}
          cy={sunY - 10}
          r={8}
          color="#E0E0E0"
        />
        <Circle
          cx={sunX + 10}
          cy={sunY + 15}
          r={12}
          color="#EBEBEB"
        />
        <Circle
          cx={sunX + 18}
          cy={sunY - 12}
          r={6}
          color="#E5E5E5"
        />
      </Group>
    )
  }

  // Original sun rendering
  const gradient = Sun.gradientAtTime(background.time, background.dayRange)
  return (
    <Group>
      <Circle cx={sunX} cy={sunY} r={CORE_RADIUS}>
        <RadialGradient
          c={{ x: sunX, y: sunY }}
          r={CORE_RADIUS}
          colors={gradient}
          positions={[0.5, 0.75, 0.9, 1]}
        />
      </Circle>
      <Circle
        cx={sunX}
        cy={sunY}
        r={OUTER_RING_RADIUS}
        color={gradient[3]}
        style="stroke"
        strokeWidth={4}
      />
      <Circle
        cx={sunX}
        cy={sunY}
        r={ringRadius}
        color={gradient[3]}
        style="stroke"
        opacity={ringOpacity}
        strokeWidth={4}
      />
    </Group>
  )
}
