import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import dayjs from "dayjs"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import { SettingsNamedToggleView } from "./components/NamedToggle"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"

export type SettingDurationCardProps = {
  style?: StyleProp<ViewStyle>
  durationInSeconds: number
}

export const SettingsDurationCard = ({
  style,
  durationInSeconds
}: SettingDurationCardProps) => {
  const duration = dayjs.duration(durationInSeconds, "s").format("H[h] m[m]")
  return (
    <TouchableOpacity style={styles.container}>
      <BodyText>{duration}</BodyText>
    </TouchableOpacity>
  )
}

export type DurationSectionViewProps = {
  currentPresets: number[]
}

export const DurationSectionView = ({
  currentPresets
}: DurationSectionViewProps) => {
  return (
    <>
      <Headline style={{ padding: 16 }}>Duration Presets</Headline>
      <View style={styles.settingsSection}>
        {currentPresets
          .sort((a, b) => {
            return a - b
          })
          .map((item, index) => {
            return (
              <SettingsDurationCard
                key={index}
                durationInSeconds={currentPresets[index]}
              />
            )
          })}
        {currentPresets.length < 6 ? (
          <SettingsDurationCard key={0} durationInSeconds={0} />
        ) : undefined}
      </View>
    </>
  )
}

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  onLocationPresetTapped: (locationPreset: Placemark) => void
}

export const EventSettingsView = ({
  style,
  onLocationPresetTapped
}: EventSettingsProps) => {
  return (
    <SettingsScrollView style={style}>
      <PresetSectionView onLocationPresetTapped={onLocationPresetTapped} />
    </SettingsScrollView>
  )
}

type PresetSectionProps = {
  onLocationPresetTapped: (locationPreset: Placemark) => void
}

const PresetSectionView = ({ onLocationPresetTapped }: PresetSectionProps) => {
  const { settings, update } = useUserSettings(
    settingsSelector(
      "eventPresetDurations",
      "eventPresetPlacemark",
      "eventPresetShouldHideAfterStartDate"
    )
  )
  return (
    <SettingsCardSectionView
      title="Presets"
      subtitle="These presets will be filled in when you create a new event."
    >
      <SettingsNamedToggleView
        name={"Hide After Start Date"}
        description={
          "The event will not be shown publicly to other users after it starts."
        }
        isOn={settings.eventPresetShouldHideAfterStartDate}
        onIsOnChange={(eventPresetShouldHideAfterStartDate) =>
          update({ eventPresetShouldHideAfterStartDate })
        }
      />
      <SettingsNavigationLinkView
        title={"Location"}
        description={settings.eventPresetPlacemark?.name ?? "No Location"}
        onTapped={() => onLocationPresetTapped(settings.eventPresetPlacemark!)}
      />
      <DurationSectionView currentPresets={[1800, 3600, 5400, 7200, 14400]} />
    </SettingsCardSectionView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: "50%",
    width: "28%",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "black",
    marginHorizontal: 8,
    marginBottom: 8,
    paddingVertical: 16
  },
  cardDuration: {
    color: AppStyles.darkColor
  },
  settingsSection: {
    alignContent: "space-between",
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16
  }
})
