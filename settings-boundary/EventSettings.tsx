import { Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { useUpdateUserSettings, useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"
import { repeatElements } from "TiFShared/lib/Array"
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
  onClosePress: () => void
}

export const SettingsDurationCard = ({
  style,
  durationInSeconds,
  onClosePress
}: SettingDurationCardProps) => {
  const fontScale = useFontScale()
  return (
    <View style={[styles.container, { height: 64 * fontScale }]}>
      <Headline>{formatEventDurationPreset(durationInSeconds)}</Headline>
      <TouchableOpacity style={styles.closeButton} onPress={onClosePress}>
        <Ionicon size={16} color={"white"} name={"close"} />
      </TouchableOpacity>
    </View>
  )
}

export const AddDurationCard = () => {
  const fontScale = useFontScale()
  return (
    <TouchableHighlight
      style={[styles.addButtonContainer, { height: 64 * fontScale }]}
    >
      <Ionicon size={36} color={AppStyles.colorOpacity35} name={"add"} />
    </TouchableHighlight>
  )
}

type DurationCardRowViewProps = {
  sortedDurations: number[]
  start: number
  end: number
}

const DurationCardRowView = ({
  sortedDurations,
  start,
  end
}: DurationCardRowViewProps) => {
  const update = useUpdateUserSettings()
  const rowArray = repeatElements(end - start, (index) => index + start)
  return (
    <View style={styles.durationPresetRow}>
      {rowArray.map((index) => {
        if (index < sortedDurations.length) {
          return (
            <SettingsDurationCard
              key={`duration-preset-key-${sortedDurations[index]}`}
              durationInSeconds={sortedDurations[index]}
              onClosePress={() =>
                update({
                  eventPresetDurations: sortedDurations.filter(
                    (item) => item !== sortedDurations[index]
                  )
                })
              }
            />
          )
        } else if (index === sortedDurations.length) {
          return <AddDurationCard key={"add-duration"} />
        } else {
          return (
            <View
              key={`blank-card-${index}`}
              style={[styles.container, { opacity: 0 }]}
            />
          )
        }
      })}
    </View>
  )
}

export const DurationSectionView = () => {
  const { settings } = useUserSettings(settingsSelector("eventPresetDurations"))
  const fontScale = useFontScale()
  const sortedDurations = settings.eventPresetDurations.sort((a, b) => a - b)
  return (
    <SettingsSectionView title="Duration Presets">
      <View style={styles.presetRowsGridContainer}>
        {fontScale < FontScaleFactors.accessibility1 ? (
          <>
            <DurationCardRowView
              sortedDurations={sortedDurations}
              start={0}
              end={3}
            />
            <DurationCardRowView
              sortedDurations={sortedDurations}
              start={3}
              end={6}
            />
          </>
        ) : (
          <>
            <DurationCardRowView
              sortedDurations={sortedDurations}
              start={0}
              end={2}
            />
            <DurationCardRowView
              sortedDurations={sortedDurations}
              start={2}
              end={4}
            />
            <DurationCardRowView
              sortedDurations={sortedDurations}
              start={4}
              end={6}
            />
          </>
        )}
      </View>
    </SettingsSectionView>
  )
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
      subtitle="These presets will be populated when you create an event."
    >
      <SettingsNamedToggleView
        name={"Hide After Start Date"}
        description={
          "The event will no longer be publicly visible to other users once it starts."
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
