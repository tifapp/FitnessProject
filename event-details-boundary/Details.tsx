import { RegionMonitorContext } from "@arrival-tracking"
import { TiFFooterView } from "@components/Footer"
import { TiFFormCardView } from "@components/form-components/Card"
import { DashedLine } from "@components/form-components/DashedLine"
import { TiFFormNamedIconRowView } from "@components/form-components/NamedIconRow"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"
import { BodyText, Headline, Title } from "@components/Text"
import { ClientSideEvent, ClientSideEventTime } from "@event/ClientSideEvent"
import { UseLoadEventDetailsResult } from "@event/DetailsQuery"
import { EventUserAttendanceButton } from "@event/UserAttendance"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import React, { memo } from "react"
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { isAttendingEvent } from "TiFShared/domain-models/Event"
import {
  EventArrivalBannerView,
  eventArrivalBannerCountdown,
  useIsShowingEventArrivalBanner
} from "./ArrivalBanner"
import { EventAttendeeCardView } from "./AttendeesList"
import { EventAttendeesPreview } from "./AttendeesPreview"
import { EventMocks } from "./MockData"
import PassportCountdown from "./PassportCountdown"
import { useEventSecondsToStart } from "./SecondsToStart"
import { EventTravelEstimatesView, useEventTravelEstimates } from "./TravelEstimates"

export type EventDetailsProps = {
  state: Extract<UseLoadEventDetailsResult, { status: "success" }>
  style?: StyleProp<ViewStyle>
}

const _EventDetailsView = ({ state, style }: EventDetailsProps) => (
  <View style={style}>
    <DashedLine style={{ position: "absolute", left: -8, top: -8, width: "100%", zIndex: 11 }} dashStyle={{ transform: "rotate(45deg)" }} dashLength={16} dashThickness={16} dashGap={6} dashColor={AppStyles.primaryBlue.toString()} />
    <TiFFormScrollableLayoutView
      footer={<FooterView event={state.event} />}
      style={styles.details}
    >
      <DashedLine axis="vertical" style={{ position: "absolute", height: "100%", left: 23 }} dashLength={6} dashThickness={2} dashGap={4} dashColor={AppStyles.colorOpacity15} />
      <DashedLine axis="vertical" dashStyle={{ borderRadius: 100 }} style={{ position: "absolute", height: "100%", left: -4 }} dashLength={12} dashThickness={12} dashGap={48} dashColor={AppStyles.cardColor} />
      <View style={{
          gap: 16,
          marginLeft: 16,
          borderRadius: 32,
          paddingTop: 28,
          marginBottom: -8 - 32
      }}>
        <Title>{state.event.title}</Title>
        <HostSectionView event={state.event} />
      </View>
      <ArrivalSectionView event={state.event} />
      <EventTravelEstimatesView
        style={{ marginLeft: 16 }}
        eventTitle={state.event.title}
        host={state.event.host}
        location={state.event.location}
        result={useEventTravelEstimates(state.event.location.coordinate)}
        parallaxFactor={3}
      />
      <View style={{ paddingLeft: 16, rowGap: 16, marginTop: 12 }}>
        <LocationSectionView event={state.event} />
        <TimeSectionView event={state.event} />
        <DescriptionSectionView event={state.event} />
        <TiFFormSectionView iconName="people-outline" title="Attendees">
          <EventAttendeesPreview TextVariant={Headline} attendeeSize={64} event={state.event} />
        </TiFFormSectionView>
      </View>
    </TiFFormScrollableLayoutView>
  </View>
)

export const EventDetailsView = memo(_EventDetailsView)

type SectionProps = {
  event: ClientSideEvent
}

const ArrivalSectionView = ({ event }: SectionProps) => {
  const {
    settings: { canShareArrivalStatus }
  } = useUserSettings(settingsSelector("canShareArrivalStatus"))
  const { monitor } = RegionMonitorContext.useContext()
  const { isShowing, close } = useIsShowingEventArrivalBanner(
    event.location,
    monitor
  )
  const secondsToStart = useEventSecondsToStart(event.time)
  return (
    isShowing && (
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <TiFFormSectionView>
          <EventArrivalBannerView
            hasJoinedEvent={isAttendingEvent(event.userAttendeeStatus)}
            canShareArrivalStatus={canShareArrivalStatus}
            countdown={eventArrivalBannerCountdown(
              secondsToStart,
              event.time.todayOrTomorrow ?? null
            )}
            onClose={close}
          />
        </TiFFormSectionView>
      </Animated.View>
    )
  )
}

const TimeSectionView = ({ event }: SectionProps) => (
  <TiFFormCardSectionView title="Showtime">
    <TiFFormNamedIconRowView
      iconName="calendar"
      iconBackgroundColor={"transparent"}
      name={event.time.dateRange.ext.formatted()}
    />
  </TiFFormCardSectionView>
)

const HostSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView color="black" title="Hosted By">
    <EventAttendeeCardView
      style={{
        borderRadius: 64,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: AppStyles.cardColor,
        overflow: "hidden"
      }}
      attendee={event.host}
      onRelationStatusChanged={() =>
        console.log("TODO: Sean Organize Query Cache")
      }
    />
  </TiFFormSectionView>
)

const DescriptionSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="Blurb" iconName="cafe-outline">
    <BodyText>
      {!!event.description && event.description.length > 0
        ? event.description
        : "To Be Announced"}
    </BodyText>
  </TiFFormSectionView>
)

const LocationSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="Destination">
    <TiFFormCardView>
      <TiFFormNamedIconRowView
        iconName="location"
        iconBackgroundColor={"transparent"}
        name={event.location.placemark?.name ?? "Unknown Location"}
        description={
          event.location.placemark
            ? (placemarkToFormattedAddress(event.location.placemark) ??
              "Unknown Address")
            : "Unknown Address"
        }
      />
    </TiFFormCardView>
  </TiFFormSectionView>
)

type FooterProps = {
  event: ClientSideEvent
}

const FooterView = ({ event }: FooterProps) => (
  <TiFFooterView backgroundStyle={{ backgroundColor: "transparent" }}>
    <View style={styles.footer}>
      <EventUserAttendanceButton
        event={event}
        onJoinSuccess={() => console.log("TODO: Sean Organize Query Cache")}
        onLeaveSuccess={() => console.log("TODO: Sean Oragnize Query Cache")}
        style={styles.attendanceButton}
      />
      <CountdownView time={event.time} />
    </View>
  </TiFFooterView>
)

type CountdownProps = {
  time: ClientSideEventTime
}

const CountdownView = ({ time }: CountdownProps) => {
  const secondsToStart = useEventSecondsToStart(time)

  return <PassportCountdown
  secondsToStart={secondsToStart}
  />
}

const styles = StyleSheet.create({
  details: {
    height: "100%"
  },
  border: {
    height: 2000,
    width: 100,
    backgroundColor: "transparent",
    position: "absolute",
    left: -100,
    top: -50,
    zIndex: 10,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: AppStyles.colorOpacity15
  },
  attendanceButton: {
    position: "absolute",
    bottom: 0,
    right: 24
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 64
  },
  screen: {
    // backgroundColor: AppStyles.cardColor,
    overflow: "hidden"
  },
  labelStyle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500"
  },
  digitBlockStyle: {
    backgroundColor: "#34495E",
    borderRadius: 5
  },
  separatorStyle: {
    color: "#FFF"
  }
})
