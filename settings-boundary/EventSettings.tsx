import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/User"
import React from "react"
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsSectionView } from "./components/Section"
import { SettingsToggleCardView } from "./components/ToggleCard"

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

export type SettingsDurationCardViewProps = {
  title: string
  currentPresets: number[]
}

export const SettingsDurationCardView = ({
  title,
  currentPresets
}: SettingsDurationCardViewProps) => {
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

export type EventSettingsViewProps = {
  style?: StyleProp<ViewStyle>
}

export const EventSettingsView = ({ style }: EventSettingsViewProps) => {
  const { settings, update } = useUserSettings(eventSettingsSelector)
  return (
    <ScrollView style={style}>
      <SettingsSectionView title="Event Settings">
        <SettingsToggleCardView
          iconName={"push"}
          iconBackgroundColor={AppStyles.green}
          title={"Hide Event After Start Date"}
          description={""}
          isOn={settings.eventPresetShouldHideAfterStartDate}
          onIsOnChange={(eventPresetShouldHideAfterStartDate) =>
            update({ eventPresetShouldHideAfterStartDate })
          }
          style={style}
        ></SettingsToggleCardView>
        <SettingsNavigationLinkView
          title={"Location"}
          iconName={"push"}
          iconBackgroundColor={AppStyles.blue}
          onTapped={() => console.log("goToLocationSearch")}
          style={style}
        ></SettingsNavigationLinkView>
        <SettingsDurationCardView
          title={"Duration Presets"}
          currentPresets={[15, 30, 60, 120]}
        ></SettingsDurationCardView>
      </SettingsSectionView>
    </ScrollView>
  )
}

const eventSettingsSelector = (settings: UserSettings) => ({
  eventPresetDurations: settings.eventPresetDurations,
  eventPresetPlacemark: settings.eventPresetPlacemark,
  eventPresetShouldHideAfterStartDate:
    settings.eventPresetShouldHideAfterStartDate
})

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
