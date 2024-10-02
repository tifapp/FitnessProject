import {
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
  LayoutRectangle,
  TouchableOpacity,
  Platform
} from "react-native"
import {
  DEFAULT_EDIT_EVENT_FORM_VALUES,
  EditEventFormValues,
  editEventFormInitialValuesAtom,
  editEventFormValueAtoms,
  editEventFormValuesAtom
} from "./FormValues"
import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import {
  PragmaQuoteView,
  createEventQuote,
  editEventQuote
} from "./PragmaQuotes"
import { useAtom, useStore } from "jotai"
import { ShadedTextField } from "@components/TextFields"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useScreenBottomPadding } from "@components/Padding"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useUserSettings } from "@settings-storage/Hooks"
import { EditEventDurationPickerView } from "./DurationPicker"
import {
  Ionicon,
  IoniconCloseButton,
  TouchableIonicon
} from "@components/common/Icons"
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
import { ClientSideEvent } from "@event/ClientSideEvent"
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { useSharedValue } from "react-native-reanimated"
import { DurationPickerView } from "@modules/tif-duration-picker"
import RNDateTimePicker, {
  DateTimePickerAndroid as RNDateTimePickerAndroid
} from "@react-native-community/datetimepicker"

export type EditEventProps = {
  eventId?: EventID
  submit: (
    eventId: EventID | undefined,
    edit: EventEdit
  ) => Promise<ClientSideEvent>
  onSuccess: (event: ClientSideEvent) => void
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
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date")
  const animatedIndex = useSharedValue(1)

  const presentAndroidDatePicker = (mode: "date" | "time") => {
    RNDateTimePickerAndroid.open({
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
                bottomSheetRef.current?.present()
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
                bottomSheetRef.current?.present()
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
      </TiFFormSectionView>
      {Platform.OS === "ios" && (
        <BottomSheetModal
          ref={bottomSheetRef}
          handleStyle={styles.sheetHandle}
          snapPoints={SNAP_POINTS}
          enableContentPanningGesture={false}
          enablePanDownToClose={false}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={1}
              animatedIndex={animatedIndex}
            />
          )}
        >
          <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
            <View style={styles.bottonSheetTopRow}>
              <View style={styles.bottomSheetTopRowSpacer} />
              <IoniconCloseButton
                size={20}
                onPress={() => bottomSheetRef.current?.dismiss()}
              />
            </View>
            <View style={styles.durationPickerSheetStyle}>
              <RNDateTimePicker
                mode={datePickerMode}
                value={startDate}
                display={datePickerMode === "date" ? "inline" : "spinner"}
                onChange={(_, date) => {
                  if (date) setStartDate(date)
                }}
              />
            </View>
          </SafeAreaView>
        </BottomSheetModal>
      )}
    </>
  )
}

const DurationSectionView = () => {
  const {
    settings: { eventPresetDurations }
  } = useUserSettings(settingsSelector("eventPresetDurations"))
  const [duration, setDuration] = useAtom(editEventFormValueAtoms.duration)
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const animatedIndex = useSharedValue(1)
  return (
    <>
      <TiFFormSectionView
        title="Length?"
        rightAddon={
          <TouchableIonicon
            icon={{ name: "ellipsis-horizontal" }}
            onPress={() => bottomSheetRef.current?.present()}
          />
        }
      >
        <EditEventDurationPickerView
          durationAtom={editEventFormValueAtoms.duration}
          presetOptions={eventPresetDurations}
        />
      </TiFFormSectionView>
      <BottomSheetModal
        ref={bottomSheetRef}
        handleStyle={styles.sheetHandle}
        snapPoints={SNAP_POINTS}
        enableContentPanningGesture={false}
        enablePanDownToClose={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            animatedIndex={animatedIndex}
          />
        )}
      >
        <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
          <View style={styles.bottonSheetTopRow}>
            <View style={styles.bottomSheetTopRowSpacer} />
            <IoniconCloseButton
              size={20}
              onPress={() => bottomSheetRef.current?.dismiss()}
            />
          </View>
          <View style={styles.durationPickerSheetStyle}>
            <DurationPickerView
              initialDurationSeconds={duration}
              onDurationChange={setDuration}
              style={styles.durationPicker}
            />
          </View>
        </SafeAreaView>
      </BottomSheetModal>
    </>
  )
}

const SNAP_POINTS = ["50%"]

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
  onSuccess: (event: ClientSideEvent) => void
}

const FooterView = ({ eventId, onSuccess, submit }: FooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  return (
    <EditEventFormSubmitButton
      state={useEditEventFormSubmission({ eventId, submit, onSuccess })}
      style={{
        paddingTop: 8,
        paddingBottom: useSafeAreaInsets().bottom + bottomPadding
      }}
    />
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
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: AppStyles.eventCardColor
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
  }
})
