import {
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
  LayoutRectangle
} from "react-native"
import {
  DEFAULT_EDIT_EVENT_FORM_VALUES,
  EditEventFormValues,
  editEventFormInitialValuesAtom,
  editEventFormValueAtoms,
  editEventFormValuesAtom,
  eventEditAtom
} from "./FormValues"
import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import {
  PragmaQuoteView,
  createEventQuote,
  editEventQuote
} from "./PragmaQuotes"
import { useAtom, useAtomValue, useStore } from "jotai"
import { ShadedTextField } from "@components/TextFields"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import { useCallback, useEffect, useState } from "react"
import { useScreenBottomPadding } from "@components/Padding"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PrimaryButton } from "@components/Buttons"
import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/Settings"
import { EditEventDurationPickerView } from "./DurationPicker"
import { Ionicon, TouchableIonicon } from "@components/common/Icons"
import { dayjs } from "TiFShared/lib/Dayjs"
import { Headline } from "@components/Text"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"
import { TiFFormNamedToggleView } from "@components/form-components/NamedToggle"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { settingsSelector } from "@settings-storage/Settings"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { EditEventFormSubmitButton, useEditEventFormSubmission } from "./Submit"

export type EditEventProps = {
  eventId?: EventID
  submit: (eventId: EventID | undefined, edit: EventEdit) => Promise<void>
  onSuccess: () => void
  currentDate?: Date
  initialValues?: EditEventFormValues
  style?: StyleProp<ViewStyle>
}

export const useHydrateEditEvent = (initialValues?: EditEventFormValues) => {
  const { settings } = useUserSettings(
    settingsSelector(
      "eventPresetPlacemark",
      "eventPresetShouldHideAfterStartDate"
    )
  )
  const initialFormValues = initialValues ?? {
    ...DEFAULT_EDIT_EVENT_FORM_VALUES,
    location: settings.eventPresetPlacemark
      ? {
          placemark: settings.eventPresetPlacemark,
          coordinate: undefined
        }
      : undefined,
    shouldHideAfterStartDate: settings.eventPresetShouldHideAfterStartDate
  }
  const store = useStore()
  const hydrate = useEffectEvent(() => {
    store.set(editEventFormValuesAtom, { ...initialFormValues })
    store.set(editEventFormInitialValuesAtom, { ...initialFormValues })
  })
  useEffect(() => hydrate(), [hydrate])
}

export const EditEventView = ({
  eventId,
  currentDate = new Date(),
  submit,
  onSuccess,
  initialValues,
  style
}: EditEventProps) => {
  useHydrateEditEvent(initialValues)
  const [footerLayout, setFooterLayout] = useState<
    LayoutRectangle | undefined
  >()
  return (
    <View style={style}>
      <View style={styles.container}>
        <TiFFormScrollView>
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
        </TiFFormScrollView>
        <View
          style={styles.footer}
          onLayout={(e) => setFooterLayout(e.nativeEvent.layout)}
        >
          <FooterView eventId={eventId} submit={submit} onSuccess={onSuccess} />
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
    <TiFFormSectionView>
      <PragmaQuoteView
        quote={eventId ? editEventQuote : createQuote}
        animationInterval={5}
      />
    </TiFFormSectionView>
  )
}

const TitleSectionView = () => {
  const [title, setTitle] = useAtom(editEventFormValueAtoms.title)
  const height = 32 * useFontScale()
  return (
    <TiFFormSectionView title="What?">
      <ShadedTextField
        placeholder="Enter an Event Title"
        value={title}
        onChangeText={setTitle}
        textStyle={{ height }}
      />
    </TiFFormSectionView>
  )
}

const LocationSectionView = () => {
  return (
    <TiFFormSectionView title="Where?">
      <TiFFormNavigationLinkView
        iconName="location"
        iconBackgroundColor={AppStyles.black}
        title="No Location"
        description="You must select a location to create this event."
        style={styles.locationNavigationLink}
        chevronStyle={styles.locationNavigationLinkChevron}
        onTapped={() => console.log("TODO")}
      />
    </TiFFormSectionView>
  )
}

const StartDateSectionView = () => {
  const [startDate, setStartDate] = useAtom(editEventFormValueAtoms.startDate)
  const date = dayjs(startDate)
  return (
    <TiFFormSectionView title="When?">
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
    </TiFFormSectionView>
  )
}

const DurationSectionView = () => {
  const {
    settings: { eventPresetDurations }
  } = useUserSettings(settingsSelector("eventPresetDurations"))
  return (
    <TiFFormSectionView
      title="Length?"
      rightAddon={<TouchableIonicon icon={{ name: "ellipsis-horizontal" }} />}
    >
      <EditEventDurationPickerView
        durationAtom={editEventFormValueAtoms.duration}
        presetOptions={eventPresetDurations}
      />
    </TiFFormSectionView>
  )
}

const DescriptionSectionView = () => {
  const [description, setDescription] = useAtom(
    editEventFormValueAtoms.description
  )
  const minHeight = 128 * useFontScale()
  return (
    <TiFFormSectionView title="Details?">
      <ShadedTextField
        placeholder="Enter an Event Description"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
        textStyle={{ minHeight }}
      />
    </TiFFormSectionView>
  )
}

const AdvancedSectionView = () => {
  const [shouldHideAfterStartDate, setShouldHideAfterStartDate] = useAtom(
    editEventFormValueAtoms.shouldHideAfterStartDate
  )
  return (
    <TiFFormCardSectionView title="Settings">
      <TiFFormNamedToggleView
        name="Should Hide After Start Date"
        description="The event will be hidden from the map after it starts when enabled."
        isOn={shouldHideAfterStartDate}
        onIsOnChange={setShouldHideAfterStartDate}
      />
    </TiFFormCardSectionView>
  )
}

type FooterProps = {
  eventId?: EventID
  submit: (eventId: EventID | undefined, edit: EventEdit) => Promise<void>
  onSuccess: () => void
}

const FooterView = ({ eventId, onSuccess, submit }: FooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  return (
    <View
      style={{
        paddingTop: 8,
        paddingBottom: useSafeAreaInsets().bottom + bottomPadding
      }}
    >
      <EditEventFormSubmitButton
        state={useEditEventFormSubmission({ eventId, submit, onSuccess })}
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
