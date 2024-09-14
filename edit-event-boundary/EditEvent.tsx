import {
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
  LayoutRectangle
} from "react-native"
import {
  EditEventFormValues,
  editEventFormValueAtoms,
  editEventFormValuesAtom,
  eventEditAtom
} from "./FormValues"
import { useHydrateAtoms } from "jotai/utils"
import { EventID } from "TiFShared/domain-models/Event"
import {
  PragmaQuoteView,
  createEventQuote,
  editEventQuote
} from "./PragmaQuotes"
import { useAtom, useAtomValue } from "jotai"
import {
  SettingsCardSectionView,
  SettingsSectionView
} from "settings-boundary/components/Section"
import { ShadedTextField } from "@components/TextFields"
import { SettingsScrollView } from "settings-boundary/components/ScrollView"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import { SettingsNavigationLinkView } from "settings-boundary/components/NavigationLink"
import { SettingsNamedToggleView } from "settings-boundary/components/NamedToggle"
import { useCallback, useState } from "react"
import { useScreenBottomPadding } from "@components/Padding"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PrimaryButton } from "@components/Buttons"
import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/Settings"
import { EditEventDurationPickerView } from "./DurationPicker"
import { Ionicon, TouchableIonicon } from "@components/common/Icons"
import { dayjs } from "TiFShared/lib/Dayjs"
import { Headline } from "@components/Text"

export type EditEventProps = {
  eventId?: EventID
  currentDate?: Date
  initialValues: EditEventFormValues
  style?: StyleProp<ViewStyle>
}

export const EditEventView = ({
  eventId,
  currentDate = new Date(),
  initialValues,
  style
}: EditEventProps) => {
  useHydrateAtoms([[editEventFormValuesAtom, initialValues]])
  const [footerLayout, setFooterLayout] = useState<
    LayoutRectangle | undefined
  >()
  return (
    <View style={style}>
      <View style={styles.container}>
        <SettingsScrollView>
          <QuoteSectionView eventId={eventId} currentDate={currentDate} />
          <TitleSectionView />
          <LocationSectionView />
          <StartDateSectionView />
          <DurationSectionView />
          <DescriptionSectionView />
          <AdvancedSectionView />
          {footerLayout && (
            <View style={{ marginBottom: footerLayout.height }} />
          )}
        </SettingsScrollView>
        <View
          style={styles.footer}
          onLayout={(e) => setFooterLayout(e.nativeEvent.layout)}
        >
          <FooterView eventId={eventId} />
        </View>
      </View>
    </View>
  )
}

type QuoteSectionProps = {
  eventId?: EventID
  currentDate: Date
}

const QuoteSectionView = ({ eventId, currentDate }: QuoteSectionProps) => {
  const createQuote = useCallback(
    () => createEventQuote(currentDate),
    [currentDate]
  )
  return (
    <SettingsSectionView>
      <PragmaQuoteView
        quote={eventId ? editEventQuote : createQuote}
        animationInterval={5}
      />
    </SettingsSectionView>
  )
}

const TitleSectionView = () => {
  const [title, setTitle] = useAtom(editEventFormValueAtoms.title)
  const height = 32 * useFontScale()
  return (
    <SettingsSectionView title="What?">
      <ShadedTextField
        placeholder="Enter an Event Title"
        value={title}
        onChangeText={setTitle}
        textStyle={{ height }}
      />
    </SettingsSectionView>
  )
}

const LocationSectionView = () => {
  return (
    <SettingsSectionView title="Where?">
      <SettingsNavigationLinkView
        iconName="location"
        iconBackgroundColor={AppStyles.black}
        title="No Location"
        description="You must select a location to create this event."
        style={styles.locationNavigationLink}
        chevronStyle={styles.locationNavigationLinkChevron}
        onTapped={() => console.log("TODO")}
      />
    </SettingsSectionView>
  )
}

const StartDateSectionView = () => {
  const [startDate, setStartDate] = useAtom(editEventFormValueAtoms.startDate)
  const date = dayjs(startDate)
  return (
    <SettingsSectionView title="When?">
      <View style={styles.startDateRow}>
        <View style={styles.startDateRowItem}>
          <Ionicon name="calendar" />
          <Headline>{date.format("DD/MM/YYYY")}</Headline>
        </View>
        <View style={styles.startDateRowItem}>
          <Ionicon name="timer" />
          <Headline>{date.format("HH:mm A")}</Headline>
        </View>
      </View>
    </SettingsSectionView>
  )
}

const DurationSectionView = () => {
  const {
    settings: { presets }
  } = useUserSettings(durationsSectionSettingsSelector)
  return (
    <SettingsSectionView
      title="Length?"
      rightAddon={<TouchableIonicon icon={{ name: "ellipsis-horizontal" }} />}
    >
      <EditEventDurationPickerView
        durationAtom={editEventFormValueAtoms.duration}
        presetOptions={presets}
      />
    </SettingsSectionView>
  )
}

const durationsSectionSettingsSelector = (settings: UserSettings) => ({
  presets: settings.eventPresetDurations
})

const DescriptionSectionView = () => {
  const [description, setDescription] = useAtom(
    editEventFormValueAtoms.description
  )
  const minHeight = 128 * useFontScale()
  return (
    <SettingsSectionView title="Details?">
      <ShadedTextField
        placeholder="Enter an Event Description"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
        textStyle={{ minHeight }}
      />
    </SettingsSectionView>
  )
}

const AdvancedSectionView = () => {
  const [shouldHideAfterStartDate, setShouldHideAfterStartDate] = useAtom(
    editEventFormValueAtoms.shouldHideAfterStartDate
  )
  return (
    <SettingsCardSectionView title="Settings">
      <SettingsNamedToggleView
        name="Should Hide After Start Date"
        description="The event will be hidden from the map after it starts when enabled."
        isOn={shouldHideAfterStartDate}
        onIsOnChange={setShouldHideAfterStartDate}
      />
    </SettingsCardSectionView>
  )
}

type FooterProps = {
  eventId?: EventID
}

const FooterView = ({ eventId }: FooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  const eventEdit = useAtomValue(eventEditAtom)
  return (
    <View
      style={{
        paddingTop: 8,
        paddingBottom: useSafeAreaInsets().bottom + bottomPadding
      }}
    >
      <PrimaryButton
        title={!eventId ? "Create Event" : "Update Event"}
        disabled={!eventEdit}
        style={styles.submitButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    paddingHorizontal: 24
  },
  submitButton: {
    width: "100%"
  },
  locationNavigationLink: {
    width: "100%",
    borderStyle: "dashed",
    borderRadius: 12,
    borderColor: AppStyles.darkColor,
    borderWidth: 2
  },
  locationNavigationLinkChevron: {
    opacity: 1
  },
  startDateRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16
  },
  startDateRowItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    columnGap: 8,
    padding: 16,
    backgroundColor: AppStyles.eventCardColor
  }
})
