import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
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
  SharedValue,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"

const INNER_TRACK_GAP = 8

export type EditEventDurationPickerProps = {
  // NB: An atom gives us a significant performance boost over using a set of
  // value/onValueChange props.
  durationAtom: PrimitiveAtom<number>
  presetOptions: number[]
  style?: StyleProp<ViewStyle>
}

export const EditEventDurationPickerView = ({
  durationAtom,
  presetOptions,
  style
}: EditEventDurationPickerProps) => {
  const setDuration = useSetAtom(durationAtom)
  const [presetsState, setPresetsState] = useState(
    initialPresetsState(presetOptions)
  )
  const isSliding = useSharedValue(false)
  const sliderPosition = useSharedValue(0)
  const height =
    80 * useFontScale({ maximumScaleFactor: FontScaleFactors.large })
  useEffect(
    () => setPresetsState(initialPresetsState(presetOptions)),
    [presetOptions]
  )
  return (
    <View style={style}>
      <View style={styles.container}>
        <View style={[styles.backgroundCard, { height }]} />
        <BackgroundTrailView
          height={height}
          isSliding={isSliding}
          sliderPosition={sliderPosition}
        />
        <DurationsRowView
          durations={presetOptions.sort((a, b) => a - b)}
          height={height}
          onDurationLayout={(layout) => {
            setPresetsState((state) => ({
              ...state,
              offsets:
                state.offsets.length >= state.presetOptions.length
                  ? [layout]
                  : state.offsets.concat(layout)
            }))
          }}
          onDurationChange={setDuration}
        />
        <SliderKnobView
          durationAtom={durationAtom}
          isSliding={isSliding}
          sliderPosition={sliderPosition}
          presetsState={presetsState}
          height={height}
        />
      </View>
    </View>
  )
}

type BackgroundTrailProps = {
  sliderPosition: SharedValue<number>
  isSliding: SharedValue<boolean>
  height: number
}

const BackgroundTrailView = ({
  sliderPosition,
  isSliding,
  height
}: BackgroundTrailProps) => (
  <Animated.View
    style={[
      styles.backgroundTrail,
      useAnimatedStyle(() => ({
        width: sliderPosition.value + INNER_TRACK_GAP * 3,
        height: withTiFDefaultSpring(
          height - (isSliding.value ? 0 : INNER_TRACK_GAP * 2)
        ) as number,
        marginTop: withTiFDefaultSpring(!isSliding.value ? INNER_TRACK_GAP : 0),
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
)

type DurationsRowProps = {
  durations: number[]
  height: number
  onDurationLayout: (layout: LayoutRectangle) => void
  onDurationChange: (duration: number) => void
}

const DurationsRowView = ({
  durations,
  height,
  onDurationLayout,
  onDurationChange
}: DurationsRowProps) => (
  <View style={[styles.presetsRow, { height }]}>
    {durations.map((duration) => (
      <View
        key={`d-${duration}`}
        style={styles.presetItem}
        onLayout={(e) => onDurationLayout(e.nativeEvent.layout)}
      >
        <Pressable onPress={() => onDurationChange(duration)}>
          <BodyText
            maxFontSizeMultiplier={FontScaleFactors.large}
            style={styles.presetText}
          >
            {formatEventDurationPreset(duration)}
          </BodyText>
        </Pressable>
      </View>
    ))}
  </View>
)

type SliderKnobProps = {
  durationAtom: PrimitiveAtom<number>
  sliderPosition: SharedValue<number>
  isSliding: SharedValue<boolean>
  presetsState: PresetsState
  height: number
}

const SliderKnobView = ({
  durationAtom,
  sliderPosition,
  isSliding,
  presetsState,
  height
}: SliderKnobProps) => {
  const [duration, setDuration] = useAtom(durationAtom)
  const selectedDimensions = dimensionsForDuration(presetsState, duration)
  const event = useEffectEvent((dimensions?: LayoutRectangle) => {
    if (!isSliding.value) {
      sliderPosition.value = withTiFDefaultSpring(dimensions?.x ?? 0)
    }
  })
  const previousTranslation = useSharedValue(0)
  useEffect(() => event(selectedDimensions), [selectedDimensions, event])
  const panGestureBounds = bounds(presetsState)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      sliderPosition.value = clamp(
        -INNER_TRACK_GAP,
        panGestureBounds.end,
        sliderPosition.value + (event.translationX - previousTranslation.value)
      )
      previousTranslation.value = event.translationX
      const nextDuration = durationAtPosition(
        presetsState,
        sliderPosition.value
      )
      if (nextDuration !== duration) runOnJS(setDuration)(nextDuration)
    })
    .onFinalize(() => {
      const nextPosition =
        sliderPosition.value < 0
          ? 0
          : dimensionsForDuration(presetsState, duration)?.x ?? 0
      sliderPosition.value = withTiFDefaultSpring(nextPosition)
      runOnJS(setDuration)(durationAtPosition(presetsState, nextPosition))
      previousTranslation.value = 0
    })
    .onTouchesDown(() => (isSliding.value = true))
    .onTouchesUp(() => (isSliding.value = false))
    .onTouchesCancelled(() => (isSliding.value = false))
  return (
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
            style={[styles.selectedText, { width: selectedDimensions?.width }]}
            maxFontSizeMultiplier={FontScaleFactors.large}
          >
            {formatEventDurationPreset(duration)}
          </Headline>
        </View>
      </Animated.View>
    </GestureDetector>
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
