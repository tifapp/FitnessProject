import {
  Circle,
  LinearGradient,
  RadialGradient,
  Rect,
  vec
} from "@shopify/react-native-skia"
import { useEffect } from "react"
import { StyleProp, ViewStyle, useWindowDimensions } from "react-native"
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated"

export type SunBackgroundProps = {
  style?: StyleProp<ViewStyle>
}

export const SunBackgroundView = ({ style }: SunBackgroundProps) => {
  const dimensions = useWindowDimensions()
  const CENTER_X = dimensions.width / 2
  const CENTER_Y = dimensions.height / 2
  const CORE_RADIUS = 128
  const OUTER_RING_RADIUS = 144
  const FADE_RING_RADIUS = 160
  const ringRadius = useSharedValue(FADE_RING_RADIUS)
  const ringOpacity = useSharedValue(0.5)
  useEffect(() => {
    ringRadius.value = withRepeat(
      withTiming(180, {
        duration: 2000,
        easing: Easing.linear
      }),
      -1,
      false
    )
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, {
          duration: 500,
          easing: Easing.linear
        }),
        withTiming(0, {
          duration: 1500,
          easing: Easing.linear
        })
      ),
      -1,
      true
    )
  }, [ringRadius, ringOpacity])
  return (
    <>
      <Rect width={dimensions.width} height={dimensions.height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(dimensions.width, dimensions.height)}
          colors={["#3AC4F7", "#297DEA", "#7B10F6"]}
        />
      </Rect>
      <Circle cx={CENTER_X} cy={CENTER_Y} r={CORE_RADIUS}>
        <RadialGradient
          c={{ x: CENTER_X, y: CENTER_Y }}
          r={CORE_RADIUS}
          colors={["#FFFCF0", "#FFFBCC", "#FEE87D", "#FDD62F"]}
          positions={[0.5, 0.75, 0.9, 1]}
        />
      </Circle>
      <Circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={OUTER_RING_RADIUS}
        color="#FFD700"
        style="stroke"
        strokeWidth={4}
      />
      <Circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={ringRadius}
        color="#FFD700"
        style="stroke"
        opacity={ringOpacity}
        strokeWidth={4}
      />
    </>
  )
}
