import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { useEffect, useRef, useState } from "react"
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  View,
  LayoutRectangle,
  Pressable
} from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"

const INNER_TRACK_GAP = 8

export type EditEventDurationPickerProps = {
  value: number
  presetOptions: number[]
  onValueChange: (option: number) => void
  style?: StyleProp<ViewStyle>
}

export const EditEventDurationPickerView = ({
  value,
  presetOptions,
  onValueChange,
  style
}: EditEventDurationPickerProps) => {
  const [presetsState, setPresetsState] = useState(
    initialPresetsState(presetOptions)
  )
  const isSliding = useSharedValue(false)
  const sliderPosition = useSharedValue(0)
  const height =
    80 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
  useEffect(
    () => setPresetsState(initialPresetsState(presetOptions)),
    [presetOptions]
  )
  const durations = presetOptions.sort((a, b) => a - b)
  const selectedDimensions = dimensionsForDuration(presetsState, value)
  const panGestureBounds = bounds(presetsState)
  const event = useEffectEvent((dimensions?: LayoutRectangle) => {
    if (!isSliding.value) {
      sliderPosition.value = withTiFDefaultSpring(dimensions?.x ?? 0)
    }
  })
  const previousTranslation = useSharedValue(0)
  useEffect(() => event(selectedDimensions), [selectedDimensions, event])
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { end } = panGestureBounds
      sliderPosition.value = clamp(
        -INNER_TRACK_GAP,
        end,
        sliderPosition.value + (event.translationX - previousTranslation.value)
      )
      previousTranslation.value = event.translationX
      const duration = durationAtPosition(presetsState, sliderPosition.value)
      if (duration !== value) runOnJS(onValueChange)(duration)
    })
    .onFinalize(() => {
      const nextPosition =
        sliderPosition.value < 0
          ? 0
          : dimensionsForDuration(presetsState, value)?.x ?? 0
      sliderPosition.value = withTiFDefaultSpring(nextPosition)
      runOnJS(onValueChange)(durationAtPosition(presetsState, nextPosition))
      previousTranslation.value = 0
    })
    .onTouchesDown(() => (isSliding.value = true))
    .onTouchesUp(() => (isSliding.value = false))
    .onTouchesCancelled(() => (isSliding.value = false))
  return (
    <View style={style}>
      <View style={styles.container}>
        <View style={[styles.backgroundCard, { height }]} />
        <Animated.View
          style={[
            styles.backgroundTrail,
            useAnimatedStyle(() => ({
              width: sliderPosition.value + INNER_TRACK_GAP * 3,
              height: withTiFDefaultSpring(
                height - (isSliding.value ? 0 : INNER_TRACK_GAP * 2)
              ) as number,
              marginTop: withTiFDefaultSpring(
                !isSliding.value ? INNER_TRACK_GAP : 0
              ),
              marginLeft: withTiFDefaultSpring(
                !isSliding.value ? INNER_TRACK_GAP : 0
              ),
              borderBottomLeftRadius: withTiFDefaultSpring(
                isSliding.value ? INNER_TRACK_GAP * 2 : INNER_TRACK_GAP
              ),
              borderTopLeftRadius: withTiFDefaultSpring(
                isSliding.value ? INNER_TRACK_GAP * 2 : INNER_TRACK_GAP
              )
            }))
          ]}
        />
        <View style={[styles.presetsRow, { height }]}>
          {durations.map((duration) => (
            <View
              key={`d-${duration}`}
              style={styles.presetItem}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout
                setPresetsState((state) => ({
                  ...state,
                  offsets:
                    state.offsets.length >= state.presetOptions.length
                      ? [layout]
                      : state.offsets.concat(layout)
                }))
              }}
            >
              <Pressable onPress={() => onValueChange(duration)}>
                <BodyText
                  maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
                  style={styles.presetText}
                >
                  {formatEventDurationPreset(duration)}
                </BodyText>
              </Pressable>
            </View>
          ))}
        </View>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.selectedCard,
              useAnimatedStyle(() => ({
                borderRadius: withTiFDefaultSpring(
                  isSliding.value ? INNER_TRACK_GAP * 2 : INNER_TRACK_GAP
                ),
                height: withTiFDefaultSpring(
                  height - (isSliding.value ? 0 : INNER_TRACK_GAP * 2)
                ),
                width: (selectedDimensions
                  ? withTiFDefaultSpring(
                      isSliding.value
                        ? selectedDimensions.width + INNER_TRACK_GAP * 2
                        : selectedDimensions.width
                    )
                  : undefined) as number | undefined,
                marginTop: withTiFDefaultSpring(
                  isSliding.value ? 0 : INNER_TRACK_GAP
                ),
                marginLeft: INNER_TRACK_GAP,
                transform: [{ translateX: sliderPosition.value }]
              }))
            ]}
          >
            <View style={[styles.selectedContainer]}>
              <Headline
                style={[
                  styles.selectedText,
                  { width: selectedDimensions?.width }
                ]}
                maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
              >
                {formatEventDurationPreset(value)}
              </Headline>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

type PresetsState = {
  presetOptions: number[]
  offsets: LayoutRectangle[]
}

const initialPresetsState = (presetOptions: number[]) => ({
  presetOptions,
  offsets: [] as LayoutRectangle[]
})

const bounds = (state: PresetsState) => {
  if (state.offsets.length < 1) return { start: 0, end: 0 }
  return {
    start: state.offsets[0].x,
    end: state.offsets[state.offsets.length - 1].x
  }
}

const durationAtPosition = (state: PresetsState, position: number) => {
  "worklet"
  const index = state.offsets.findIndex((offset, i, offsets) => {
    if (i === offsets.length - 1) {
      return position >= offset.x - offsets[i - 1].width / 2
    }
    if (i === 0) return position < offsets[i + 1].x - offset.width / 2
    return (
      position >= offset.x - offsets[i - 1].width / 2 &&
      position < offsets[i + 1].x - offset.width / 2
    )
  })
  return state.presetOptions[index]
}

const dimensionsForDuration = (
  state: PresetsState,
  duration: number
): LayoutRectangle | undefined => {
  "worklet"
  const index = state.presetOptions.findIndex((preset, i, presets) => {
    if (i === 0) return duration <= preset
    if (i === presets.length - 1) return duration >= preset
    return duration >= preset && duration < presets[i + 1]
  })
  if (!state.offsets[index]) return undefined
  if (index === state.offsets.length - 1) {
    return state.offsets[index]
  }
  return {
    ...state.offsets[index],
    x:
      duration <= state.presetOptions[index]
        ? state.offsets[index].x - INNER_TRACK_GAP
        : state.offsets[index].x + state.offsets[index].width / 2
  }
}

const clamp = (min: number, max: number, value: number) => {
  "worklet"
  return Math.min(Math.max(min, value), max)
}

const styles = StyleSheet.create({
  container: {
    position: "relative"
  },
  backgroundTrail: {
    position: "absolute",
    backgroundColor: AppStyles.black.withOpacity(0.15).toString()
  },
  selectedCard: {
    position: "absolute",
    borderRadius: INNER_TRACK_GAP,
    backgroundColor: AppStyles.black.toString()
  },
  selectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  selectedText: {
    color: "white",
    textAlign: "center"
  },
  backgroundCard: {
    position: "absolute",
    backgroundColor: AppStyles.eventCardColor,
    borderRadius: INNER_TRACK_GAP * 2,
    width: "100%"
  },
  presetsRow: {
    display: "flex",
    flexDirection: "row",
    padding: INNER_TRACK_GAP * 2
  },
  presetItem: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  presetText: {
    textAlign: "center"
  }
})
