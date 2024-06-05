import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsNamedToggleView } from "./components/NamedToggle"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsScrollView } from "./components/ScrollView"
import {
  SettingsCardSectionView,
  SettingsSectionView
} from "./components/Section"

export type SettingDurationCardProps = {
  style?: StyleProp<ViewStyle>
  durationInSeconds: number
}

export const SettingsDurationCard = ({
  durationInSeconds
}: SettingDurationCardProps) => {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "column" }}>
        <BodyText style={styles.cardDuration}>{durationInSeconds}</BodyText>
      </View>
    </View>
  )
}

export type DurationSectionViewProps = {
  title: string
  currentPresets: number[]
}

export const DurationSectionView = ({
  title,
  currentPresets
}: DurationSectionViewProps) => {
  return (
    <SettingsSectionView style={styles.settingsSection} title={title}>
      {currentPresets.map((index) => {
        return (
          <SettingsDurationCard
            key={index}
            durationInSeconds={currentPresets[index]}
          />
        )
      })}
    </SettingsSectionView>
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
        onTapped={() => onLocationPresetTapped(settings.eventPresetPlacemark)}
      />
      <DurationSectionView
        title={"Duration Presets"}
        currentPresets={[15, 30, 60, 120]}
      />
    </SettingsCardSectionView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderColor: "black"
  },
  cardDuration: {
    color: AppStyles.darkColor
  },
  settingsSection: {
    flexWrap: "wrap"
  }
})
