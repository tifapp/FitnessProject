import { Headline } from "@components/Text"
import {
  CircularIonicon,
  Ionicon,
  TouchableIonicon
} from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { useUpdateUserSettings, useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { formatEventDurationPreset } from "TiFShared/domain-models/Settings"
import { repeatElements } from "TiFShared/lib/Array"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React, { useState } from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import Animated, {
  FadeInLeft,
  FadeOutLeft,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated"

import { DurationPickerButton } from "./EventSettingsDurationPicker"
import { TiFFormNamedToggleView } from "@components/form-components/NamedToggle"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"

export const eventSettingsEditMode = atomWithStorage("OFF", false)

export type SettingDurationCardProps = {
  style?: StyleProp<ViewStyle>
  durationInSeconds: number
  onClosePress: () => void
}

export type DurationSettingsEditModeButtonProps = {
  style?: StyleProp<ViewStyle>
}

export const DurationSettingsEditModeButton = ({
  style
}: DurationSettingsEditModeButtonProps) => {
  const [editModeOn, setEditModeOn] = useAtom(eventSettingsEditMode)
  return (
    <TouchableIonicon
      icon={editModeOn ? { name: "close" } : { name: "create" }}
      style={style}
      onPress={() => setEditModeOn((editModeOn) => !editModeOn)}
    />
  )
}

export const SettingsDurationCard = ({
  style,
  durationInSeconds,
  onClosePress
}: SettingDurationCardProps) => {
  const fontScale = useFontScale()
  const [editMode] = useAtom(eventSettingsEditMode)
  return (
    <Animated.View
      style={[styles.container, { height: 64 * fontScale }]}
      entering={FadeInLeft}
      exiting={FadeOutLeft}
      layout={TiFDefaultLayoutTransition}
    >
      <Headline>{formatEventDurationPreset(durationInSeconds)}</Headline>
      {editMode ? (
        <Animated.View
          hitSlop={{ left: 16, right: 16, top: 16, bottom: 16 }}
          style={styles.closeButton}
          entering={ZoomIn}
          exiting={ZoomOut}
          layout={TiFDefaultLayoutTransition}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={onClosePress}>
            <CircularIonicon
              size={16}
              backgroundColor={AppStyles.darkColor}
              name={"close"}
            />
          </TouchableOpacity>
        </Animated.View>
      ) : undefined}
    </Animated.View>
  )
}

export const AddDurationCard = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventPresetDurations")
  )
  const [timeInSeconds, setTimeInSeconds] = useState("")
  const fontScale = useFontScale()

  return (
    <Animated.View
      style={{ flex: 1 }}
      entering={FadeInLeft}
      exiting={FadeOutLeft}
      layout={TiFDefaultLayoutTransition}
    >
      <DurationPickerButton
        style={[styles.addButtonContainer, { height: 64 * fontScale }]}
        timeInSeconds={timeInSeconds}
        underlayColor={AppStyles.colorOpacity35}
        onAddPresetTapped={() => {
          if (
            !settings.eventPresetDurations.includes(parseInt(timeInSeconds))
          ) {
            update({
              eventPresetDurations: [
                ...settings.eventPresetDurations,
                parseInt(timeInSeconds)
              ]
            })
          }
        }}
        onChangeTime={setTimeInSeconds}
      >
        <Ionicon size={36} color={AppStyles.darkColor} name={"add"} />
      </DurationPickerButton>
    </Animated.View>
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
    <TiFFormSectionView>
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
    </TiFFormSectionView>
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
    <TiFFormScrollView style={style}>
      <PresetSectionView
        onLocationPresetTapped={onLocationPresetTapped}
        onDurationTapped={onDurationTapped}
      />
    </TiFFormScrollView>
  )
}

export type EventDurationsProps = {
  style?: StyleProp<ViewStyle>
}

export const EventDurationView = ({ style }: EventDurationsProps) => {
  return (
    <TiFFormScrollView style={style}>
      <DurationSectionView />
    </TiFFormScrollView>
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
    <TiFFormCardSectionView
      title="Presets"
      subtitle="These presets will be populated when you create an event."
    >
      <TiFFormNamedToggleView
        name={"Hide After Start Date"}
        description={
          "The event will no longer be publicly visible to other users once it starts."
        }
        isOn={settings.eventPresetShouldHideAfterStartDate}
        onIsOnChange={(eventPresetShouldHideAfterStartDate) =>
          update({ eventPresetShouldHideAfterStartDate })
        }
      />
      <TiFFormNavigationLinkView
        title={"Location"}
        description={settings.eventPresetPlacemark?.name ?? "No Location"}
        onTapped={() => onLocationPresetTapped(settings.eventPresetPlacemark!)}
      />
      <TiFFormNavigationLinkView
        title={"Durations"}
        description={"Set Durations"}
        onTapped={() => onDurationTapped()}
      />
    </TiFFormCardSectionView>
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
    borderStyle: "dashed",
    paddingHorizontal: 32,
    borderColor: AppStyles.darkColor,
    backgroundColor: AppStyles.eventCardColor,
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
    right: "-5%",
    top: "-10%",
    position: "absolute",
    borderColor: "black"
  }
})
