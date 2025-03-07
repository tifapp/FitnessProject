import { RegionMonitorContext } from "@arrival-tracking"
import { TiFFooterView } from "@components/Footer"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormNamedIconRowView } from "@components/form-components/NamedIconRow"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import {
  TiFFormCardSectionView,
  TiFFormSectionView
} from "@components/form-components/Section"
import { BodyText, Title } from "@components/Text"
import { ClientSideEvent, ClientSideEventTime } from "@event/ClientSideEvent"
import { UseLoadEventDetailsResult } from "@event/DetailsQuery"
import { EventUserAttendanceButton } from "@event/UserAttendance"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { AppStyles } from "@lib/AppColorStyle"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { memo } from "react"
import {
  RefreshControl,
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
import { EventCountdownView, eventCountdown } from "./Countdown"
import { useEventSecondsToStart } from "./SecondsToStart"
import {
  EventTravelEstimatesView,
  useEventTravelEstimates
} from "./TravelEstimates"

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
      <LocationSectionView event={state.event} />
      <TimeSectionView event={state.event} />
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
  <TiFFormCardSectionView title="Airtime">
    <TiFFormNamedIconRowView
      iconName="calendar"
      iconBackgroundColor={AppStyles.blue}
      name={event.time.dateRange.ext.formatted()}
    />
  </TiFFormCardSectionView>
)

const HostSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView title="Hosted By">
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
  <TiFFormSectionView title="Destination">
    <EventTravelEstimatesView
      eventTitle={event.title}
      host={event.host}
      location={event.location}
      result={useEventTravelEstimates(event.location.coordinate)}
    />
    <TiFFormCardView style={{ marginTop: 8 }}>
      <TiFFormNamedIconRowView
        iconName="location"
        iconBackgroundColor={AppStyles.blue}
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
