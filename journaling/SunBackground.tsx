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
import { Cloud, MovingCloudsDrawing } from "./Clouds"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"

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
    midDay: ["#3FADFB", "#6CACFF", "#3183FD"] as SkyGradient
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
    } else if (t <= 0.3) {
      return gradients.morning
    } else if (t <= 0.7) {
      return gradients.midDay
    } else {
      return gradients.afternoon
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

export const SunDrawing = ({ background, size, edgeInsets }: SunProps) => {
  const sunX = size.width * 0.5
  const sunY = Sun.absoluteYPosition(background.time, size, edgeInsets)
  const ringRadius = useSharedValue(FADE_RING_RADIUS)
  const ringOpacity = useSharedValue(0)
  useEffect(() => {
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
  }, [ringRadius, ringOpacity])
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
