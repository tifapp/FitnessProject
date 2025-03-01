import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import {
  events,
  hapticPattern,
  singleEventPattern,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai"
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
  const [pickerState, setPickerState] = useState(
    initialPickerState(presetOptions)
  )
  const isSliding = useSharedValue(false)
  const sliderPosition = useSharedValue(0)
  const height =
    80 * useFontScale({ maximumScaleFactor: FontScaleFactors.large })
  useEffect(
    () => setPickerState(initialPickerState(presetOptions)),
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
          durations={Array.from(pickerState.keys())}
          height={height}
          onDurationLayout={(duration, layout) => {
            setPickerState((state) => updateLayout(state, duration, layout))
          }}
          onDurationChange={setDuration}
        />
        <SliderKnobView
          durationAtom={durationAtom}
          isSliding={isSliding}
          sliderPosition={sliderPosition}
          pickerState={pickerState}
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
        width: sliderPosition.value + INNER_TRACK_GAP * 5,
        height: withTiFDefaultSpring(
          height - (isSliding.value ? 0 : INNER_TRACK_GAP * 2)
        ) as number,
        marginTop: withTiFDefaultSpring(!isSliding.value ? INNER_TRACK_GAP : 0),
        marginLeft: withTiFDefaultSpring(
          !isSliding.value ? INNER_TRACK_GAP : 0
        ),
        // NB: borderBottomLeftRadius and borderTopLeftRadius cause the track to flicker on iOS
        // when the user long presses the knob, so we can achieve the same effect by using a full
        // border radius + longer track width combo.
        borderRadius: withTiFDefaultSpring(
          isSliding.value ? INNER_TRACK_GAP * 2 : INNER_TRACK_GAP
        )
      }))
    ]}
  />
)

type DurationsRowProps = {
  durations: number[]
  height: number
  onDurationLayout: (duration: number, layout: LayoutRectangle) => void
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
      <Pressable
        key={`d-${duration}`}
        style={styles.presetItem}
        onPress={() => onDurationChange(duration)}
        onLayout={(e) => onDurationLayout(duration, e.nativeEvent.layout)}
      >
        <BodyText
          maxFontSizeMultiplier={FontScaleFactors.large}
          style={styles.presetText}
        >
          {formatDuration(duration)}
        </BodyText>
      </Pressable>
    ))}
  </View>
)

const formatDuration = (duration: number) => {
  return formatEventDurationPreset(duration).replace(" ", "\n")
}

type SliderKnobProps = {
  durationAtom: PrimitiveAtom<number>
  sliderPosition: SharedValue<number>
  isSliding: SharedValue<boolean>
  pickerState: EditEventDurationPickerState
  height: number
}

// const durationChangedPattern

const HAPTIC_PATTERNS = [
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.4, HapticSharpness: 0.5 })
  ),
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.5, HapticSharpness: 0.6 })
  ),
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.6, HapticSharpness: 0.7 })
  ),
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.7, HapticSharpness: 0.8 })
  ),
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.8, HapticSharpness: 0.9 })
  ),
  singleEventPattern(
    transientEvent(0.0, { HapticIntensity: 0.9, HapticSharpness: 1.0 })
  )
]

const useSliderKnob = (
  durationAtom: PrimitiveAtom<number>,
  isSliding: SharedValue<boolean>,
  sliderPosition: SharedValue<number>,
  stateEntries: EditEventDurationPickerStateEntries
) => {
  const haptics = useHaptics()
  const [duration, setDuration] = useAtom(durationAtom)
  const animateToPosition = useEffectEvent((dimensions?: LayoutRectangle) => {
    if (!isSliding.value) {
      sliderPosition.value = withTiFDefaultSpring(dimensions?.x ?? 0)
    }
  })
  return {
    duration,
    animateToPosition,
    setDuration: (duration: number) => {
      haptics.playIfSupported(
        HAPTIC_PATTERNS[durationIndex(stateEntries, duration)],
        ["isFeedbackSupportedOnDevice"]
      )
      setDuration(duration)
    }
  }
}

const SliderKnobView = ({
  durationAtom,
  sliderPosition,
  isSliding,
  pickerState,
  height
}: SliderKnobProps) => {
  const stateEntries = pickerStateEntries(pickerState)
  const { duration, animateToPosition, setDuration } = useSliderKnob(
    durationAtom,
    isSliding,
    sliderPosition,
    stateEntries
  )
  const selectedDimensions = layoutForDuration(stateEntries, duration)
  const previousTranslation = useSharedValue(0)
  const didAppear = useRef(false)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (!didAppear.current) {
      timeout = setTimeout(() => {
        animateToPosition(selectedDimensions)
      }, 300)
      didAppear.current = true
    } else {
      animateToPosition(selectedDimensions)
    }
    return () => clearTimeout(timeout)
  }, [selectedDimensions, animateToPosition])
  const panGestureEndBound = endBound(pickerState)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      sliderPosition.value = clamp(
        -INNER_TRACK_GAP,
        panGestureEndBound,
        sliderPosition.value + (event.translationX - previousTranslation.value)
      )
      previousTranslation.value = event.translationX
      const nextDuration = durationAtPosition(
        stateEntries,
        sliderPosition.value
      )
      if (nextDuration !== duration) runOnJS(setDuration)(nextDuration)
    })
    .onFinalize(() => {
      const nextPosition =
        sliderPosition.value < 0
          ? 0
          : (layoutForDuration(stateEntries, duration)?.x ?? 0)
      sliderPosition.value = withTiFDefaultSpring(nextPosition)
      runOnJS(setDuration)(durationAtPosition(stateEntries, nextPosition))
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
            {formatDuration(duration)}
          </Headline>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

export type EditEventDurationPickerState = Map<
  number,
  LayoutRectangle | undefined
>
export type EditEventDurationPickerStateEntries = [
  number,
  LayoutRectangle | undefined
][]

const FALLBACK_DEFAULT_DURATIONS = [1800, 2700, 3600]

export const initialPickerState = (
  durations: number[]
): EditEventDurationPickerState => {
  const initialDurations =
    durations.length >= 3
      ? durations
      : [...new Set(durations.concat(FALLBACK_DEFAULT_DURATIONS))]
  return new Map(
    initialDurations.sort((a, b) => a - b).map((d) => [d, undefined])
  )
}

export const pickerStateEntries = (state: EditEventDurationPickerState) => {
  return Array.from(state.entries())
}

export const updateLayout = (
  state: EditEventDurationPickerState,
  duration: number,
  layout: LayoutRectangle
): EditEventDurationPickerState => {
  const newState = new Map(state)
  newState.set(duration, layout)
  return newState
}

export const endBound = (state: EditEventDurationPickerState) => {
  const keys = Array.from(state.keys())
  return state.get(keys[keys.length - 1])?.x ?? 0
}

const layout = (
  entries: EditEventDurationPickerStateEntries,
  index: number
) => {
  "worklet"
  return entries[index][1] ?? ZEROED_LAYOUT_RECTANGLE
}

const isPastBeginning = (
  position: number,
  l: LayoutRectangle | undefined,
  index: number,
  entries: EditEventDurationPickerStateEntries
) => {
  "worklet"
  return position >= (l?.x ?? 0) - (layout(entries, index - 1).width ?? 0) / 2
}

const isBeforeEnd = (
  position: number,
  l: LayoutRectangle | undefined,
  index: number,
  entries: EditEventDurationPickerStateEntries
) => {
  "worklet"
  return position < layout(entries, index + 1).x - (l?.width ?? 0) / 2
}

export const durationAtPosition = (
  entries: EditEventDurationPickerStateEntries,
  position: number
) => {
  "worklet"
  const index = entries.findIndex(([_, layout], i, entries) => {
    if (i === entries.length - 1) {
      return isPastBeginning(position, layout, i, entries)
    }
    if (i === 0) return isBeforeEnd(position, layout, i, entries)
    return (
      isPastBeginning(position, layout, i, entries) &&
      isBeforeEnd(position, layout, i, entries)
    )
  })
  return entries[index][0]
}

const durationIndex = (
  entries: EditEventDurationPickerStateEntries,
  duration: number
) => {
  "worklet"
  return entries.findIndex(([d, _], i, entries) => {
    if (i === entries.length - 1) return duration >= d
    if (i === 0) return duration < entries[i + 1][0]
    return duration >= d && duration < entries[i + 1][0]
  })
}

export const layoutForDuration = (
  entries: EditEventDurationPickerStateEntries,
  duration: number
) => {
  "worklet"
  const index = durationIndex(entries, duration)
  if (!entries[index]) return undefined
  if (index === entries.length - 1) return entries[index][1]
  return {
    ...layout(entries, index),
    x:
      duration <= entries[index][0]
        ? layout(entries, index).x - INNER_TRACK_GAP
        : layout(entries, index).x + layout(entries, index).width / 2
  }
}

const ZEROED_LAYOUT_RECTANGLE = { width: 0, height: 0, x: 0, y: 0 }

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
    backgroundColor: AppStyles.primary.withOpacity(0.15).toString()
  },
  selectedCard: {
    position: "absolute",
    borderRadius: INNER_TRACK_GAP,
    backgroundColor: AppStyles.primary.toString()
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
    backgroundColor: AppStyles.cardColor,
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
