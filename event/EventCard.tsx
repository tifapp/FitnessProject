import { TiFFormCardView } from "@components/form-components/Card"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { EventActionsMenuView, useEventActionsMenu } from "./Menu"
import {
  BodyText,
  BoldFootnote,
  Caption,
  Footnote,
  Headline,
  Subtitle
} from "@components/Text"
import { CalendarDayView } from "@components/CalendarDay"
import { EventUserAttendanceButton } from "./UserAttendance"
import { Ionicon } from "@components/common/Icons"
import dayjs from "dayjs"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { placemarkToAbbreviatedAddress } from "@lib/AddressFormatting"
import { ProfileCircleView } from "@components/profileImageComponents/ProfileCircle"
import { FontScaleFactors } from "@lib/Fonts"

export type EventCardProps = {
  event: ClientSideEvent
  onDetailsTapped?: () => void
  onAttendeesTapped?: () => void
  onEditEventTapped?: () => void
  onCopyEventTapped?: () => void
  onJoined?: () => void
  onLeft?: () => void
  style?: StyleProp<ViewStyle>
}

export const EventCard = ({
  event,
  onDetailsTapped,
  onAttendeesTapped,
  onEditEventTapped,
  onCopyEventTapped,
  onJoined,
  onLeft,
  style
}: EventCardProps) => (
  <TiFFormCardView style={style}>
    <View style={styles.container}>
      <View style={styles.centeredRow}>
        <View style={styles.leftRow}>
          <ProfileImageAndName
            name={event.host.name}
            handle={event.host.handle}
            imageURL={event.host.profileImageURL}
            maximumFontSizeMultiplier={FontScaleFactors.xxxLarge}
          />
        </View>
        <EventActionsMenuView
          event={event}
          state={useEventActionsMenu(event)}
          eventShareContent={async () => ({
            title: "TODO",
            message: "We need to figure this out..."
          })}
          onCopyEventTapped={() => onCopyEventTapped?.()}
          onEditEventTapped={() => onEditEventTapped?.()}
          style={styles.menu}
        />
      </View>
      <Pressable onPress={onDetailsTapped}>
        <View style={styles.detailsRow}>
          <View style={styles.infoColumn}>
            <Subtitle>{event.title}</Subtitle>
            <View style={[styles.centeredRow, styles.iconSpacing]}>
              <Ionicon name="calendar" size={16} />
              <Footnote>
                {eventCardFormattedDateRange(event.time.dateRange)}
              </Footnote>
            </View>
            <View style={[styles.centeredRow, styles.iconSpacing]}>
              <Ionicon name="location" size={16} />
              <Footnote>
                {event.location.placemark
                  ? placemarkToAbbreviatedAddress(event.location.placemark)
                  : "Unknown Location"}
              </Footnote>
            </View>
          </View>
          <CalendarDayView date={event.time.dateRange.startDateTime} />
        </View>
      </Pressable>
      <View style={styles.centeredRow}>
        <Pressable onPress={onAttendeesTapped} style={styles.leftRow}>
          <View style={styles.centeredRow}>
            {event.previewAttendees.slice(0, 3).map((a, index) => (
              <ProfileCircleView
                key={a.id}
                imageURL={a.profileImageURL}
                name={a.name}
                maximumFontSizeMultiplier={FontScaleFactors.large}
                style={[styles.profileCircle, { left: index * -16 }]}
              />
            ))}
            {event.attendeeCount > 3 ? (
              <BoldFootnote
                maxFontSizeMultiplier={FontScaleFactors.large}
                style={styles.attendingText}
              >
                + {event.attendeeCount - 3} Attending
              </BoldFootnote>
            ) : (
              <BoldFootnote
                maxFontSizeMultiplier={FontScaleFactors.large}
                style={styles.attendingText}
              >
                Attending
              </BoldFootnote>
            )}
          </View>
        </Pressable>
        <EventUserAttendanceButton
          event={event}
          maximumFontSizeMultiplier={FontScaleFactors.large}
          onJoinSuccess={() => onJoined?.()}
          onLeaveSuccess={() => onLeft?.()}
          size="small"
          style={styles.attendanceButton}
        />
      </View>
    </View>
  </TiFFormCardView>
)

export const eventCardFormattedDateRange = (range: FixedDateRange) => {
  const start = dayjs(range.startDateTime).format("dddd, h:mm")
  const end = dayjs(range.endDateTime).format("h:mm A")
  return `${start}-${end}`
}

const styles = StyleSheet.create({
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
  attendingText: {
    left: -24
  }
})
