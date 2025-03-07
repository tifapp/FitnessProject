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
import DashedLine from "react-native-dashed-line"
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
import { EventTravelEstimatesView, useEventTravelEstimates } from "./TravelEstimates"

export type EventDetailsProps = {
  state: Extract<UseLoadEventDetailsResult, { status: "success" }>
  style?: StyleProp<ViewStyle>
}

const _EventDetailsView = ({ state, style }: EventDetailsProps) => (
  <View style={[styles.screen, style]}>
    <DashedLine style={{ position: "absolute", left: -8, top: -8, width: "100%", zIndex: 11 }} dashStyle={{ transform: "rotate(45deg)" }} dashLength={16} dashThickness={16} dashGap={6} dashColor={AppStyles.primaryBlue.toString()} />
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
      <DashedLine axis="vertical" style={{ position: "absolute", height: "100%", left: 24 }} dashLength={6} dashThickness={2} dashGap={8} dashColor={AppStyles.colorOpacity15} />
      <View style={{
          gap: 16,
          marginLeft: 16,
          borderRadius: 32,
          paddingHorizontal: 16,
          paddingTop: 24
      }}>
        <Title>{state.event.title}</Title>
        <HostSectionView event={state.event} />
      </View>
      <ArrivalSectionView event={state.event} />

      <EventTravelEstimatesView
          eventTitle={state.event.title}
          host={state.event.host}
          location={state.event.location}
          result={useEventTravelEstimates(state.event.location.coordinate)}
          parallaxFactor={1}
        />
      <View style={{ paddingLeft: 32, rowGap: 16 }}>
      <LocationSectionView event={state.event} />
      <TimeSectionView event={state.event} />
      <TimeSectionView event={state.event} />
      <DescriptionSectionView event={state.event} />
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
  <TiFFormCardSectionView title="Airtime">
    <TiFFormNamedIconRowView
      iconName="calendar-outline"
      iconBackgroundColor={AppStyles.blue}
      name={event.time.dateRange.ext.formatted()}
    />
  </TiFFormCardSectionView>
)

const HostSectionView = ({ event }: SectionProps) => (
  <TiFFormSectionView color="black" title="Hosted By">
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
    <TiFFormCardView>
      <TiFFormNamedIconRowView
        iconName="location-outline"
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
    alignSelf: "flex-end"
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  screen: {
    // backgroundColor: AppStyles.cardColor
    overflow: "hidden"
  }
})
