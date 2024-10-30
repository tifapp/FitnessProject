import { PrimaryButton, SecondaryOutlinedButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { TiFFormSectionView } from "@components/form-components/Section"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import {
  HapticEvent,
  HapticPattern,
  events,
  hapticPattern,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { RudeusAPI } from "./RudeusAPI"
import { Platform } from "react-native"
import { RudeusPattern, RudeusPlatform } from "./Models"
import { useState } from "react"
import { TiFFormCardView } from "@components/form-components/Card"
import { Headline } from "@components/Text"
import Slider from "@react-native-community/slider"

export type RudeusPatternEditorPattern = {
  id?: string
  name: string
  ahapPattern: HapticPattern
}

export const editorPattern = (pattern: RudeusPattern) => ({
  name: pattern.name,
  ahapPattern: pattern.ahapPattern
})

export const DEFAULT_PATTERN_EDITOR_PATTERN = {
  name: "",
  ahapPattern: hapticPattern(events())
} as Readonly<RudeusPatternEditorPattern>

export const sharePattern = async (
  pattern: RudeusPatternEditorPattern,
  api: RudeusAPI
) => {
  return (
    await api.savePattern({
      body: {
        ...pattern,
        description: "",
        ahapPattern: { Version: 1, ...pattern.ahapPattern },
        platform: Platform.OS as RudeusPlatform
      }
    })
  ).data
}

export type UseRudeusPatternEditorEnvironment = {
  share: (pattern: RudeusPatternEditorPattern) => Promise<RudeusPattern>
}

export const useRudeusPatternEditor = (
  initialPattern: RudeusPatternEditorPattern,
  { share }: UseRudeusPatternEditorEnvironment
) => {
  const [pattern, setPattern] = useState(initialPattern)
  return {
    pattern,
    setPattern,
    shared: () => {
      share(pattern)
    }
  }
}

export type RudeusPatternEditorProps = {
  state: ReturnType<typeof useRudeusPatternEditor>
  style?: StyleProp<ViewStyle>
}

export const RudeusPatternEditorView = ({
  state,
  style
}: RudeusPatternEditorProps) => {
  const haptics = useHaptics()
  return (
    <View style={style}>
      <TiFFormScrollableLayoutView
        footer={
          <TiFFooterView>
            <View style={styles.footerRow}>
              <PrimaryButton
                onPress={() => haptics.play(state.pattern.ahapPattern)}
                style={styles.playButton}
              >
                Play
              </PrimaryButton>
              <SecondaryOutlinedButton
                onPress={() => state.shared()}
                style={styles.playButton}
              >
                Share
              </SecondaryOutlinedButton>
            </View>
          </TiFFooterView>
        }
        style={styles.layout}
      >
        <TiFFormSectionView title="Pattern Name">
          <ShadedTextField
            value={state.pattern.name}
            onChangeText={(text) =>
              state.setPattern((p) => ({ ...p, name: text }))
            }
            placeholder="Enter a Name"
            textStyle={{ height: 32 * useFontScale() }}
          />
        </TiFFormSectionView>
        <TiFFormSectionView title="Events">
          {state.pattern.ahapPattern.Pattern.map((e, i) => {
            const event = "Event" in e ? e.Event : ({} as HapticEvent)
            const intensity = event.EventParameters.find(
              (p) => p.ParameterID === "HapticIntensity"
            )
            const intensityIndex = event.EventParameters.findIndex(
              (p) => p.ParameterID === "HapticIntensity"
            )
            const sharpness = event.EventParameters.find(
              (p) => p.ParameterID === "HapticSharpness"
            )
            const sharpnessIndex = event.EventParameters.findIndex(
              (p) => p.ParameterID === "HapticSharpness"
            )
            return (
              <TiFFormCardView key={i}>
                <View style={styles.card}>
                  <Headline>Time: {event.Time}</Headline>
                  <Slider
                    value={event.Time}
                    minimumValue={0}
                    maximumValue={10}
                    onValueChange={(Time) =>
                      state.setPattern((p) => {
                        return {
                          ...p,
                          ahapPattern: {
                            Pattern: p.ahapPattern.Pattern.with(i, {
                              Event: { ...event, Time }
                            })
                          }
                        }
                      })
                    }
                  />
                  <Headline>
                    Intensity: {intensity?.ParameterValue ?? 0}
                  </Headline>
                  <Slider
                    value={intensity?.ParameterValue ?? 0}
                    minimumValue={0}
                    maximumValue={1}
                    onValueChange={(newIntensity) => {
                      haptics.play(
                        hapticPattern(
                          events(
                            transientEvent(0, {
                              HapticIntensity: newIntensity
                            })
                          )
                        )
                      )
                      state.setPattern((p) => {
                        return {
                          ...p,
                          ahapPattern: {
                            Pattern: p.ahapPattern.Pattern.with(i, {
                              Event: {
                                ...event,
                                EventParameters: intensity?.ParameterValue
                                  ? event.EventParameters.with(intensityIndex, {
                                      ParameterID: "HapticIntensity",
                                      ParameterValue: newIntensity
                                    })
                                  : event.EventParameters.concat({
                                      ParameterID: "HapticIntensity",
                                      ParameterValue: newIntensity
                                    })
                              }
                            })
                          }
                        }
                      })
                    }}
                  />
                  <Headline>
                    Sharpness: {sharpness?.ParameterValue ?? 0}
                  </Headline>
                  <Slider
                    value={sharpness?.ParameterValue ?? 0}
                    minimumValue={0}
                    maximumValue={1}
                    onValueChange={(newSharpness) => {
                      haptics.play(
                        hapticPattern(
                          events(
                            transientEvent(0, {
                              HapticSharpness: newSharpness
                            })
                          )
                        )
                      )
                      state.setPattern((p) => {
                        return {
                          ...p,
                          ahapPattern: {
                            Pattern: p.ahapPattern.Pattern.with(i, {
                              Event: {
                                ...event,
                                EventParameters: intensity?.ParameterValue
                                  ? event.EventParameters.with(sharpnessIndex, {
                                      ParameterID: "HapticSharpness",
                                      ParameterValue: newSharpness
                                    })
                                  : event.EventParameters.concat({
                                      ParameterID: "HapticSharpness",
                                      ParameterValue: newSharpness
                                    })
                              }
                            })
                          }
                        }
                      })
                    }}
                  />
                </View>
              </TiFFormCardView>
            )
          })}
        </TiFFormSectionView>
        <TiFFormSectionView>
          <PrimaryButton
            onPress={() =>
              state.setPattern((p) => ({
                ...p,
                ahapPattern: {
                  Pattern: p.ahapPattern.Pattern.concat({
                    Event: transientEvent(0, {})
                  })
                }
              }))
            }
          >
            Add Section
          </PrimaryButton>
        </TiFFormSectionView>
      </TiFFormScrollableLayoutView>
    </View>
  )
}

const styles = StyleSheet.create({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16
  },
  playButton: {
    flex: 1
  },
  shareButton: {
    flex: 1,
    backgroundColor: "white"
  },
  shareButtonContent: {
    color: AppStyles.primaryColor
  },
  layout: {
    flex: 1
  },
  card: {
    padding: 16
  }
})
