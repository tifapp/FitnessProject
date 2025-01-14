import {
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform
} from "react-native"
import {
  editEventFormInitialValuesAtom,
  editEventFormValueAtoms,
  editEventFormValuesAtom
} from "./FormAtoms"
import { EventEditLocation, EventID } from "TiFShared/domain-models/Event"
import {
  PragmaQuoteView,
  createEventQuote,
  editEventQuote
} from "./PragmaQuotes"
import { useAtom, useAtomValue, useStore } from "jotai"
import { ShadedTextField } from "@components/TextFields"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useCallback, useEffect, useState } from "react"
import { useScreenBottomPadding } from "@components/Padding"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUserSettings } from "@settings-storage/Hooks"
import { EditEventDurationPickerView } from "./DurationPicker"
import {
  Ionicon,
  IoniconCloseButton,
  TouchableIonicon
} from "@components/common/Icons"
import { dayjs } from "TiFShared/lib/Dayjs"
import { BodyText, Headline } from "@components/Text"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"
import { TiFFormNamedToggleView } from "@components/form-components/NamedToggle"
import { settingsSelector } from "@settings-storage/Settings"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import {
  EditEventFormSubmitButton,
  submitEventEdit,
  useEditEventFormSubmission
} from "./Submit"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { BottomSheetView } from "@gorhom/bottom-sheet"
import { DurationPickerView } from "@modules/tif-duration-picker"
import RNDateTimePicker, {
  DateTimePickerAndroid as RNDateTimePickerAndroid
} from "@react-native-community/datetimepicker"
import { TiFBottomSheet } from "@components/BottomSheet"
import { useConst } from "@lib/utils/UseConst"
import { TiFFormCardView } from "@components/form-components/Card"
import { formatDateTimeFromBasis } from "@date-time"
import { EditEventFormLocationView, useEditEventFormLocation } from "./Location"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { TiFFooterView } from "@components/Footer"
import {
  EditEventFormValues,
  defaultEditFormValues
} from "@event/EditFormValues"
import { featureContext } from "@lib/FeatureContext"

export const EditEventFeature = featureContext({
  submit: submitEventEdit
})

export type EditEventProps = {
  hostName: string
  hostProfileImageURL?: string
  eventId?: EventID
  onSuccess: (event: ClientSideEvent) => void
  onSelectLocationTapped: () => void
  currentDate?: Date
  initialValues?: EditEventFormValues
  style?: StyleProp<ViewStyle>
}

export const useHydrateEditEvent = (initialValues?: EditEventFormValues) => {
  const { settings } = useUserSettings(
    settingsSelector(
      "eventPresetLocation",
      "eventPresetShouldHideAfterStartDate"
    )
  )
  const initialFormValues = initialValues ?? {
    ...defaultEditFormValues(),
    location: settings.eventPresetLocation
      ? formLocation(settings.eventPresetLocation)
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

const formLocation = (location: EventEditLocation) => {
  if (location.type === "placemark") {
    return { placemark: location.value, coordinate: undefined }
  }
  return { placemark: undefined, coordinate: location.value }
}

export const EditEventView = ({
  hostName,
  hostProfileImageURL,
  eventId,
  currentDate = new Date(),
  onSelectLocationTapped,
  onSuccess,
  initialValues,
  style
}: EditEventProps) => {
  useHydrateEditEvent(initialValues)
  return (
    <TiFFormScrollableLayoutView
      footer={<FooterView eventId={eventId} onSuccess={onSuccess} />}
      style={style}
    >
      <QuoteSectionView eventId={eventId} currentDate={currentDate} />
      <TitleSectionView />
      <LocationSectionView
        hostName={hostName}
        hostProfileImageURL={hostProfileImageURL}
        onSelectLocationTapped={onSelectLocationTapped}
      />
      <StartDateSectionView />
      <DurationSectionView />
      <DescriptionSectionView />
      <AdvancedSectionView />
    </TiFFormScrollableLayoutView>
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

type LocationSectionProps = {
  onSelectLocationTapped: () => void
  hostName: string
  hostProfileImageURL?: string
}

const LocationSectionView = (props: LocationSectionProps) => (
  <TiFFormSectionView title="Where?">
    <EditEventFormLocationView
      location={useEditEventFormLocation()}
      {...props}
    />
  </TiFFormSectionView>
)

const StartDateSectionView = () => {
  const [startDate, setStartDate] = useAtom(
    editEventFormValueAtoms.startDateTime
  )
  const date = dayjs(startDate)
  const [datePickerMode, setDatePickerMode] = useState<
    "date" | "time" | undefined
  >()
  const now = useConst(new Date())
  const sheetBottomPadding = useScreenBottomPadding({
    safeAreaScreens: 48,
    nonSafeAreaScreens: 24
  })

  const presentAndroidDatePicker = (mode: "date" | "time") => {
    RNDateTimePickerAndroid.open({
      minimumDate: now,
      value: startDate,
      onChange: (_, date) => {
        if (date) setStartDate(date)
      },
      mode
    })
  }

  return (
    <>
      <TiFFormSectionView title="When?">
        <View style={styles.startDateRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (Platform.OS === "ios") {
                setDatePickerMode("date")
              } else {
                presentAndroidDatePicker("date")
              }
            }}
            style={styles.startDateRowItem}
          >
            <Headline>{date.format("MM/DD/YYYY")}</Headline>
            <Ionicon name="chevron-forward" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (Platform.OS === "ios") {
                setDatePickerMode("time")
              } else {
                presentAndroidDatePicker("time")
              }
            }}
            style={styles.startDateRowItem}
          >
            <Headline>{date.format("h:mm A")}</Headline>
            <Ionicon name="chevron-forward" />
          </TouchableOpacity>
        </View>
        <EndTimeView />
      </TiFFormSectionView>
      {Platform.OS === "ios" && (
        <TiFBottomSheet
          item={datePickerMode}
          sizing="content-size"
          handleStyle="hidden"
          onDismiss={() => setDatePickerMode(undefined)}
        >
          {(datePickerMode) => (
            <BottomSheetView>
              <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
                <View style={styles.bottonSheetTopRow}>
                  <View style={styles.bottomSheetTopRowSpacer} />
                  <IoniconCloseButton
                    size={20}
                    onPress={() => setDatePickerMode(undefined)}
                  />
                </View>
                <View style={styles.durationPickerSheetStyle}>
                  <RNDateTimePicker
                    accentColor={AppStyles.primaryColor}
                    textColor={AppStyles.primaryColor}
                    minimumDate={now}
                    mode={datePickerMode}
                    value={startDate}
                    display={datePickerMode === "date" ? "inline" : "spinner"}
                    onChange={(_, date) => {
                      if (date) setStartDate(date)
                    }}
                  />
                </View>
                <EndTimeView style={{ paddingBottom: sheetBottomPadding }} />
              </SafeAreaView>
            </BottomSheetView>
          )}
        </TiFBottomSheet>
      )}
    </>
  )
}

const DurationSectionView = () => {
  const {
    settings: { eventPresetDurations }
  } = useUserSettings(settingsSelector("eventPresetDurations"))
  const [duration, setDuration] = useAtom(editEventFormValueAtoms.duration)
  const [isShowingSheet, setIsShowingSheet] = useState(false)
  const sheetBottomPadding = useScreenBottomPadding({
    safeAreaScreens: 48,
    nonSafeAreaScreens: 24
  })
  return (
    <>
      <TiFFormSectionView
        title="Length?"
        rightAddon={
          <TouchableIonicon
            icon={{ name: "ellipsis-horizontal" }}
            onPress={() => setIsShowingSheet(true)}
          />
        }
      >
        <EditEventDurationPickerView
          durationAtom={editEventFormValueAtoms.duration}
          presetOptions={eventPresetDurations}
        />
      </TiFFormSectionView>
      <TiFBottomSheet
        isPresented={isShowingSheet}
        onDismiss={() => setIsShowingSheet(false)}
        enableContentPanningGesture={false}
        handleStyle="hidden"
        sizing="content-size"
      >
        <BottomSheetView>
          <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
            <View style={styles.bottonSheetTopRow}>
              <View style={styles.bottomSheetTopRowSpacer} />
              <IoniconCloseButton onPress={() => setIsShowingSheet(false)} />
            </View>
            <DurationPickerView
              initialDurationSeconds={duration}
              onDurationChange={setDuration}
              style={styles.durationPicker}
            />
            <EndTimeView style={{ paddingBottom: sheetBottomPadding }} />
          </SafeAreaView>
        </BottomSheetView>
      </TiFBottomSheet>
    </>
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

type EndTimeProps = {
  style?: StyleProp<ViewStyle>
}

const EndTimeView = ({ style }: EndTimeProps) => {
  const startDateTime = useAtomValue(editEventFormValueAtoms.startDateTime)
  const duration = useAtomValue(editEventFormValueAtoms.duration)
  return (
    <TiFFormCardView style={style}>
      <View style={styles.eventTimeRangeRow}>
        <Headline style={styles.eventTimeRangeLabel}>End Time</Headline>
        <BodyText style={styles.eventTimeRangeText}>
          {formatDateTimeFromBasis(
            startDateTime,
            startDateTime.ext.addSeconds(duration)
          )}
        </BodyText>
      </View>
    </TiFFormCardView>
  )
}

type FooterProps = {
  eventId?: EventID
  onSuccess: (event: ClientSideEvent) => void
}

const FooterView = ({ eventId, onSuccess }: FooterProps) => (
  <TiFFooterView>
    <EditEventFormSubmitButton
      state={useEditEventFormSubmission({
        eventId,
        submit: EditEventFeature.useContext().submit,
        onSuccess
      })}
    />
  </TiFFooterView>
)

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
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: AppStyles.cardColor
  },
  sheetHandle: {
    opacity: 0
  },
  bottomSheetView: {
    rowGap: 16,
    paddingHorizontal: 24
  },
  bottonSheetTopRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomSheetTopRowSpacer: {
    flex: 1
  },
  durationPickerSheetStyle: {
    paddingBottom: 24
  },
  durationPicker: {
    width: "100%",
    alignSelf: "center",
    height: 256
  },
  eventTimeRangeRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  eventTimeRangeLabel: {
    marginRight: 16
  },
  eventTimeRangeText: {
    flex: 1
  }
})
