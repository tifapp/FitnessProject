import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { CurrentUserEvent, EventColors } from "./Event"
import { placemarkToAbbreviatedAddress } from "@location"
import { dayjs, now } from "@date-time"
import { Ionicon, IoniconName } from "@components/common/Icons"
import { BodyText, Caption, Headline } from "@components/Text"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"

export type EventCardProps = {
  event: CurrentUserEvent
  style?: StyleProp<ViewStyle>
}

export const EventCard = ({ event, style }: EventCardProps) => {
  const formattedStartDate = event.dateRange.formattedDate(
    now(),
    dayjs(event.dateRange.startDate)
  )

  return (
    <View style={[style, styles.container]}>
      <View style={[styles.topRow, styles.flexRow]}>
        <ProfileImageAndName
          username={event.host.username}
          userHandle={event.host.handle.toString()}
          imageURL={event.host.profileImageURL}
        />
        <ConfirmationDialogue style={styles.moreButtonStyle} />
      </View>

      <View style={styles.middleRow}>
        <Headline>{event.title}</Headline>

        <BodyText style={styles.description} numberOfLines={3}>
          {event.description}
        </BodyText>
        <IconRowView
          icon="calendar"
          text={`${formattedStartDate} • ${event.dateRange.formattedStartTime()}`}
          color={event.color}
          style={styles.bottomSpacing}
        />
        <IconRowView
          icon="location"
          text={
            event.location.placemark
              ? placemarkToAbbreviatedAddress(event.location.placemark)
              : "Unknown Address"
          }
          color={event.color}
        />
      </View>
    </View>
  )
}

type IconRowProps = {
  icon: IoniconName
  color: EventColors
  text: string
  style?: StyleProp<ViewStyle>
}

const IconRowView = ({ icon, color, text, style }: IconRowProps) => (
  <View style={[style, styles.flexRow]}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicon name={icon} color="white" style={styles.icon} />
    </View>
    <Caption style={styles.infoText}>{text}</Caption>
  </View>
)

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  topRow: {
    marginBottom: 16,
    alignItems: "center"
  },
  middleRow: {
    flex: 1,
    flexDirection: "column"
  },
  bottomSpacing: {
    marginBottom: 8
  },
  infoText: {
    textAlignVertical: "center",
    textAlign: "center",
    alignSelf: "center"
  },
  description: {
    marginBottom: 16,
    marginTop: 8
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F4F4F6"
  },
  iconMargin: {
    marginRight: 16
  },
  moreButtonStyle: {
    flex: 1,
    opacity: 0.4,
    alignItems: "flex-end"
  },
  dotIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8
  },
  iconContainer: {
    justifyContent: "center",
    alignContent: "center",
    borderRadius: 12,
    marginRight: 16
  },
  icon: {
    padding: 4
  }
})
