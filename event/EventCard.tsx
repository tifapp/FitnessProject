import { CalendarDayView } from "@components/CalendarDay"
import { Ionicon } from "@components/common/Icons"
import { DashedLine } from "@components/form-components/DashedLine"
import { useCoreNavigation } from "@components/Navigation"
import ProfilePreview from "@components/profileImageComponents/ProfileImageAndName"
import { CaptionTitle, Footnote, Subtitle } from "@components/Text"
import { EventAttendeesPreview } from "@event-details-boundary/AttendeesPreview"
import { ClientSideEvent, isEventOngoing } from "@event/ClientSideEvent"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import dayjs from "dayjs"
import React, { memo } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { EventActionsMenuView, useEventActionsMenu } from "./Menu"
import PulsingDot from "./PulsingDot"
import { EventUserAttendanceButton } from "./UserAttendance"

export type EventCardProps = {
  event: ClientSideEvent
  onLeft?: () => void
  style?: StyleProp<ViewStyle>
}

const _EventCard = ({ event, onLeft, style }: EventCardProps) => {
  const { presentProfile, pushEventDetails } = useCoreNavigation()
  return (
    <View style={style}>
      <View style={styles.card}>
        <View style={[styles.container, styles.centeredRow, styles.header]}>
          <Pressable
            onPress={() => presentProfile(event.host.id)}
            style={styles.leftRow}
          >
            <ProfilePreview
              name={event.host.name}
              handle={event.host.handle}
              imageURL={event.host.profileImageURL}
              maximumFontSizeMultiplier={FontScaleFactors.xxxLarge}
              textStyle={{ color: "white" }}
            />
          </Pressable>
          <EventActionsMenuView
            event={event}
            state={useEventActionsMenu(event)}
            eventShareContent={async () => ({
              title: "TODO",
              message: "We need to figure this out..."
            })}
            style={styles.menu}
          />
        </View>
        <DashedLine
          dashLength={16}
          dashThickness={16}
          dashGap={8}
          dashColor={"white"}
          dashStyle={styles.dash}
          style={styles.dashedLine}
        />
        <View style={styles.container}>
          <Pressable onPress={() => pushEventDetails(event.id)}>
            <View style={styles.detailsRow}>
              <View style={styles.infoColumn}>
                <Subtitle>{event.title}</Subtitle>
                <View style={[styles.centeredRow, styles.iconSpacing]}>
                  <Ionicon
                    color={AppStyles.primaryBlue.toString()}
                    name="calendar-outline"
                    size={16}
                  />
                  <Footnote>
                    {eventCardFormattedDateRange(event.time.dateRange)}
                  </Footnote>
                </View>
                <View style={[styles.centeredRow, styles.iconSpacing]}>
                  <Ionicon
                    color={AppStyles.primaryBlue.toString()}
                    name="location-outline"
                    size={16}
                  />
                  <Footnote>
                    {event.location.placemark?.name ?? "Unknown Location"}
                  </Footnote>
                </View>
                {isEventOngoing(event) && (
                  <View style={styles.ongoingRow}>
                    <PulsingDot style={styles.pulsingDot} />
                    <View style={styles.ongoing}>
                      <CaptionTitle style={styles.ongoingText}>
                        ONGOING
                      </CaptionTitle>
                    </View>
                    <View style={styles.ongoingSpacer} />
                  </View>
                )}
              </View>
              <CalendarDayView date={event.time.dateRange.startDateTime} />
            </View>
          </Pressable>
          <View style={styles.border} />
          <View style={[styles.centeredRow]}>
            <EventAttendeesPreview event={event} />
            <EventUserAttendanceButton
              event={event}
              maximumFontSizeMultiplier={FontScaleFactors.large}
              onJoinSuccess={() => pushEventDetails(event.id)}
              onLeaveSuccess={() => onLeft?.()}
              size="small"
              style={styles.attendanceButton}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export const eventCardFormattedDateRange = (range: FixedDateRange) => {
  const start = dayjs(range.startDateTime).format("dddd, h:mm")
  const end = dayjs(range.endDateTime).format("h:mm A")
  return `${start}-${end}`
}

export const EventCard = memo(_EventCard)

const styles = StyleSheet.create({
  border: {
    height: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: AppStyles.cardColor
  },
  card: {
    borderWidth: 2,
    borderRadius: 32,
    borderColor: AppStyles.colorOpacity15.toString(),
    overflow: "hidden"
  },
  container: {
    padding: 16,
    rowGap: 16
  },
  profileCircle: {
    width: 32,
    height: 32
  },
  centeredRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  header: {
    backgroundColor: AppStyles.primaryBlue.toString()
  },
  iconSpacing: {
    columnGap: 8
  },
  infoColumn: {
    rowGap: 8,
    flex: 1
  },
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 32
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  leftRow: {
    flex: 1
  },
  menu: {
    justifyContent: "center",
    opacity: 0.5
  },
  attendanceButton: {
    padding: 12
  },
  moreAttendeesText: {
    left: -24
  },
  pulsingDot: {
    marginRight: 8,
    marginLeft: 4
  },
  ongoingRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  ongoing: {
    overflow: "hidden"
  },
  ongoingText: {
    color: AppStyles.green.toString(),
    padding: 4
  },
  ongoingSpacer: {
    flex: 1
  },
  dashedLine: {
    position: "absolute",
    top: 78,
    width: "25%",
    left: "36%",
    zIndex: 11
  },
  dash: { transform: "rotate(45deg)" }
})
