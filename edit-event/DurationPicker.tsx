import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { useEffect, useState } from "react"
import { Pressable } from "react-native"
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  View,
  LayoutRectangle
} from "react-native"
import {
  Gesture,
  GestureDetector,
  TapGestureHandler
} from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"

export type EditEventDurationPickerProps = {
  value: number
  presetOptions: number[]
  onSelected: (option: number) => void
  style?: StyleProp<ViewStyle>
}

const initialPresetsState = (presetOptions: number[]) => ({
  presetOptions,
  offsets: [] as LayoutRectangle[]
})

export const EditEventDurationPickerView = ({
  value,
  presetOptions,
  onSelected,
  style
}: EditEventDurationPickerProps) => {
  const [presetsState, setPresetsState] = useState(
    initialPresetsState(presetOptions)
  )
  const isSliding = useSharedValue(false)
  const height =
    80 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
  useEffect(
    () => setPresetsState(initialPresetsState(presetOptions)),
    [presetOptions]
  )
  const durations = presetOptions.sort((a, b) => a - b)
  const selectedIndex = presetOptions.findIndex((o) => value === o)
  const selectedDimensions = presetsState.offsets[selectedIndex]
  // const pickerOffset = useSharedValue(sele)
  const tapGesture = Gesture.Tap()
    .onTouchesDown(() => (isSliding.value = true))
    .onTouchesCancelled(() => (isSliding.value = false))
    .onTouchesUp(() => (isSliding.value = false))
    .maxDuration(999999999999)
  return (
    <View style={style}>
      <View style={styles.container}>
        <View style={[styles.backgroundCard, { height }]} />
        <View
          style={[
            styles.backgroundTrail,
            {
              width: (selectedDimensions?.x ?? 0) + 8,
              height: height - 12,
              marginTop: 6,
              marginLeft: 6
            }
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
                  offsets: state.offsets.concat(layout)
                }))
              }}
            >
              <BodyText
                maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
                style={styles.presetText}
              >
                {formatEventDurationPreset(duration)}
              </BodyText>
            </View>
          ))}
        </View>
        <GestureDetector gesture={tapGesture}>
          <Animated.View
            style={[
              styles.selectedCard,
              useAnimatedStyle(() => ({
                height: withSpring(height - (isSliding.value ? 0 : 12)),
                width: (selectedDimensions
                  ? withSpring(
                      isSliding.value
                        ? selectedDimensions.width + 12
                        : selectedDimensions.width
                    )
                  : undefined) as number | undefined,
                marginTop: withSpring(isSliding.value ? 0 : 6),
                marginLeft: 6,
                left: selectedDimensions?.x ?? 0
              }))
            ]}
          >
            <View style={[styles.selectedContainer]}>
              <Headline
                style={[
                  styles.selectedText,
                  { width: selectedDimensions?.width }
                ]}
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

const styles = StyleSheet.create({
  container: {
    position: "relative"
  },
  backgroundTrail: {
    position: "absolute",
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    backgroundColor: AppStyles.black.withOpacity(0.15).toString()
  },
  selectedCard: {
    position: "absolute",
    borderRadius: 8,
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
    borderRadius: 12,
    width: "100%"
  },
  presetsRow: {
    display: "flex",
    flexDirection: "row",
    padding: 16
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
