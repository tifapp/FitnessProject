import { Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
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
  style,
  durationInSeconds
}: SettingDurationCardProps) => {
  return (
    <View style={styles.container}>
      <Headline>{formatEventDurationPreset(durationInSeconds)}</Headline>
      <TouchableOpacity style={styles.closeButton}>
        <Ionicon size={16} color={"white"} name={"close"} />
      </TouchableOpacity>
    </View>
  )
}

export const AddDurationCard = () => {
  return (
    <TouchableHighlight style={styles.addButtonContainer}>
      <Ionicon size={36} color={AppStyles.colorOpacity35} name={"add"} />
    </TouchableHighlight>
  )
}

export const DurationSectionView = () => {
  const { settings } = useUserSettings(settingsSelector("eventPresetDurations"))
  const sortedDurations = settings.eventPresetDurations.sort((a, b) => a - b)
  return (
    <SettingsSectionView title="Duration Presets">
      {sortedDurations.length < 3 ? (
        <View style={styles.presetRowsGridContainer}>
          <View style={styles.durationPresetRow}>
            {createDurationCards(0, sortedDurations, 3)}
            {settings.eventPresetDurations.length < 3 ? (
              <AddDurationCard />
            ) : undefined}
            {settings.eventPresetDurations.length < 2 ? (
              <View style={[styles.container, { opacity: 0 }]} />
            ) : undefined}
            {settings.eventPresetDurations.length < 1 ? (
              <View style={[styles.container, { opacity: 0 }]} />
            ) : undefined}
          </View>
        </View>
      ) : (
        <View style={styles.presetRowsGridContainer}>
          <View style={styles.durationPresetRow}>
            {createDurationCards(0, sortedDurations, 3)}
          </View>
          <View style={styles.durationPresetRow}>
            {createDurationCards(3, sortedDurations)}
            {settings.eventPresetDurations.length < 6 ? (
              <AddDurationCard />
            ) : undefined}
            {settings.eventPresetDurations.length < 5 ? (
              <View style={[styles.container, { opacity: 0 }]} />
            ) : undefined}
            {settings.eventPresetDurations.length < 4 ? (
              <View style={[styles.container, { opacity: 0 }]} />
            ) : undefined}
          </View>
        </View>
      )}
    </SettingsSectionView>
  )
}

export const createDurationCards = (
  start: number,
  durations: number[],
  end?: number
) => {
  return durations.slice(start, end).map((item) => {
    return (
      <>
        <SettingsDurationCard
          key={`duration-preset-key-${item}`}
          durationInSeconds={item}
        />
      </>
    )
  })
}

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  onLocationPresetTapped: (locationPreset: Placemark) => void
  onDurationTapped: () => void
}

export const EventSettingsView = ({
  style,
  onLocationPresetTapped,
  onDurationTapped
}: EventSettingsProps) => {
  return (
    <SettingsScrollView style={style}>
      <PresetSectionView
        onLocationPresetTapped={onLocationPresetTapped}
        onDurationTapped={onDurationTapped}
      />
    </SettingsScrollView>
  )
}

export type EventDurationsProps = {
  style?: StyleProp<ViewStyle>
}

export const EventDurationView = ({ style }: EventDurationsProps) => {
  return (
    <SettingsScrollView style={style}>
      <DurationSectionView />
    </SettingsScrollView>
  )
}

type PresetSectionProps = {
  onLocationPresetTapped: (locationPreset: Placemark) => void
  onDurationTapped: () => void
}

const PresetSectionView = ({
  onLocationPresetTapped,
  onDurationTapped
}: PresetSectionProps) => {
  const { settings, update } = useUserSettings(
    settingsSelector(
      "eventPresetPlacemark",
      "eventPresetShouldHideAfterStartDate"
    )
  )
  return (
    <SettingsCardSectionView
      title="Presets"
      subtitle="These presets will populate when you create a new event."
    >
      <SettingsNamedToggleView
        name={"Hide After Start Date"}
        description={
          "The event will no longer be publicly visible to other users after it starts."
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
      <SettingsNavigationLinkView
        title={"Durations"}
        description={"Set Durations"}
        onTapped={() => onDurationTapped()}
      />
    </SettingsCardSectionView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppStyles.eventCardColor,
    borderColor: "black"
  },
  addButtonContainer: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppStyles.eventCardColor,
    borderStyle: "dashed",
    opacity: 0.5,
    borderColor: AppStyles.colorOpacity50,
    borderWidth: 2
  },
  presetRowsGridContainer: {
    rowGap: 8
  },
  cardDuration: {
    color: AppStyles.darkColor
  },
  durationPresetRow: {
    alignContent: "space-between",
    justifyContent: "flex-start",
    flexDirection: "row",
    columnGap: 8,
    flexWrap: "wrap"
  },
  closeButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 24,
    borderRadius: 64,
    right: "-5%",
    top: "-10%",
    position: "absolute",
    backgroundColor: AppStyles.black.toString(),
    borderColor: "black"
  }
})
