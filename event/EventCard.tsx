import { BodyText, Caption, Headline } from "@components/Text"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import { Ionicon, IoniconName } from "@components/common/Icons"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { placemarkToAbbreviatedAddress } from "@lib/AddressFormatting"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { now } from "TiFShared/lib/Dayjs"
import dayjs from "dayjs"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type EventCardProps = {
  event: ClientSideEvent
  style?: StyleProp<ViewStyle>
}

export const EventCard = ({ event, style }: EventCardProps) => {
  const formattedStartDate = event.time.dateRange.ext.formattedDate(
    now(),
    dayjs(event.time.dateRange.startDateTime)
  )

  return (
    <View style={[style, styles.container]}>
      <View style={[styles.topRow, styles.flexRow]}>
        <ProfileImageAndName
          name={event.host.name}
          handle={event.host.handle}
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
          text={`${formattedStartDate} • ${event.time.dateRange.ext.formattedStartTime()}`}
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
  color: ColorString
  text: string
  style?: StyleProp<ViewStyle>
}

const IconRowView = ({ icon, color, text, style }: IconRowProps) => (
  <View style={[style, styles.flexRow]}>
    <View style={[styles.iconContainer, { backgroundColor: color.toString() }]}>
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
