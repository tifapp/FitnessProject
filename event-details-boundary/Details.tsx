import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { ClientSideEvent, ClientSideEventTime } from "@event/ClientSideEvent"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  RefreshControl
} from "react-native"
import { useEventSecondsToStart } from "./SecondsToStart"
import { EventCountdownView, eventCountdown } from "./Countdown"
import { EventUserAttendanceButton } from "@event/UserAttendance"
import { BodyText, Title } from "@components/Text"
import { memo } from "react"
import { TiFFooterView } from "@components/Footer"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"
import { EventAttendeeCardView } from "./AttendeesList"
import {
  EventTravelEstimatesView,
  useEventTravelEstimates
} from "./TravelEstimates"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormNamedIconRowView } from "@components/form-components/NamedIconRow"
import { AppStyles } from "@lib/AppColorStyle"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { UseLoadEventDetailsResult } from "@event/DetailsQuery"
import {
  EventArrivalBannerView,
  eventArrivalBannerCountdown,
  useIsShowingEventArrivalBanner
} from "./ArrivalBanner"
import { isAttendingEvent } from "TiFShared/domain-models/Event"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { RegionMonitorContext } from "@arrival-tracking"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

export type EventDetailsProps = {
  state: Extract<UseLoadEventDetailsResult, { status: "success" }>
  style?: StyleProp<ViewStyle>
}

const _EventDetailsView = ({ state, style }: EventDetailsProps) => (
  <View style={style}>
    <TiFFormScrollableLayoutView
      footer={<FooterView event={state.event} />}
      style={styles.details}
      refreshControl={
        <RefreshControl
          onRefresh={state.refresh}
          refreshing={state.refreshStatus === "pending"}
        />
      }
    >
      <Title>{state.event.title}</Title>
      <ArrivalSectionView event={state.event} />
      <HostSectionView event={state.event} />
      <TimeSectionView event={state.event} />
      <LocationSectionView event={state.event} />
      <DescriptionSectionView event={state.event} />
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
  <TiFFormCardSectionView title="Date & Time">
    <TiFFormNamedIconRowView
      iconName="calendar"
      iconBackgroundColor={AppStyles.primary}
      name={event.time.dateRange.ext.formatted()}
    />
  </TiFFormCardSectionView>
)

const HostSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="Host">
    <EventAttendeeCardView
      attendee={event.host}
      onRelationStatusChanged={() =>
        console.log("TODO: Sean Organize Query Cache")
      }
    />
  </TiFFormSectionView>
)

const DescriptionSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="About">
    <BodyText>
      {!!event.description && event.description.length > 0
        ? event.description
        : "No Description"}
    </BodyText>
  </TiFFormSectionView>
)

const LocationSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="Location">
    <TiFFormCardView>
      <TiFFormNamedIconRowView
        iconName="location"
        iconBackgroundColor={AppStyles.primary}
        name={event.location.placemark?.name ?? "Unknown Location"}
        description={
          event.location.placemark
            ? (placemarkToFormattedAddress(event.location.placemark) ??
              "Unknown Address")
            : "Unknown Address"
        }
      />
    </TiFFormCardView>
    <EventTravelEstimatesView
      eventTitle={event.title}
      host={event.host}
      location={event.location}
      result={useEventTravelEstimates(event.location.coordinate)}
    />
  </TiFFormSectionView>
)

type FooterProps = {
  event: ClientSideEvent
}

const FooterView = ({ event }: FooterProps) => (
  <TiFFooterView>
    <View style={styles.footer}>
      <CountdownView time={event.time} />
      <EventUserAttendanceButton
        event={event}
        onJoinSuccess={() => console.log("TODO: Sean Organize Query Cache")}
        onLeaveSuccess={() => console.log("TODO: Sean Oragnize Query Cache")}
        style={styles.attendanceButton}
      />
    </View>
  </TiFFooterView>
)

type CountdownProps = {
  time: ClientSideEventTime
}

const CountdownView = ({ time }: CountdownProps) => {
  const secondsToStart = useEventSecondsToStart(time)
  const countdown = eventCountdown(
    secondsToStart,
    time.dateRange,
    time.todayOrTomorrow ?? null
  )
  return <EventCountdownView countdown={countdown} />
}

const styles = StyleSheet.create({
  details: {
    height: "100%"
  },
  attendanceButton: {
    alignSelf: "flex-end"
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
})
