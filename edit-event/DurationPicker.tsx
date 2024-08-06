import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { useEffect, useState } from "react"
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  View,
  LayoutRectangle
} from "react-native"
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
  const height =
    80 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
  useEffect(
    () => setPresetsState(initialPresetsState(presetOptions)),
    [presetOptions]
  )
  const durations = presetOptions.sort((a, b) => a - b)
  const selectedIndex = presetOptions.findIndex((o) => value === o)
  const backgroundTrailWith = presetsState.offsets[selectedIndex]?.x ?? 0
  return (
    <View style={style}>
      <View style={styles.container}>
        <View style={[styles.backgroundCard, { height }]} />
        <View
          style={[
            styles.backgroundTrail,
            {
              width: backgroundTrailWith - 12,
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
