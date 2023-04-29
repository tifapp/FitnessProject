import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { CurrentUserEvent, isHostingEvent } from "@lib/events/Event"
import { placemarkToAbbreviatedAddress } from "@lib/location"
import { Ionicons } from "@expo/vector-icons"
import MenuDropdown from "./MenuDropdown"
import { dayjs, now } from "@lib/date"
import { Ionicon } from "@components/common/Icons"
import { Headline } from "@components/Text"
import { ButtonStyles } from "@lib/ButtonStyle"

export type EventCardProps = {
  event: CurrentUserEvent
}

export const EventCard = ({ event }: EventCardProps) => {
  const hexAlpha = "4D"
  const lightEventColor = event.color + hexAlpha
  const formattedStartDate = event.dateRange.formattedDate(now(), dayjs(event.dateRange.startDate))

  return (
    <View style={[styles.container, { backgroundColor: "#F4F4F6" }]}>
      <View style={[styles.topRow, styles.flexRow]}>
        <Image
          style={[styles.image, styles.iconMargin]}
          source={require("../../assets/icon.png")}
          accessibilityLabel="profile picture"
        />
        <View>
          <Text style={[styles.text14px, {fontFamily: "OpenSansBold"}]}>
            {event.host.username}
          </Text>
        </View>
        <View style={styles.moreButtonStyle}>
          <MenuDropdown
            isEventHost={isHostingEvent(event.userAttendeeStatus)}
          />
        </View>
      </View>
      <View style={styles.middleRow}>
        <Headline style={[styles.textColor, styles.bottomSpacing]}>
          {event.title}
        </Headline>

        <Text
          style={[styles.bottomSpacing, styles.text14px]}
          numberOfLines={3}
        >
          {event.description}
        </Text>

        <View style={[styles.flexRow, styles.bottomSpacing]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicon
              name="calendar-outline"
              color={event.color}
              style={styles.icon}
            />
          </View>
          <Text style={styles.infoText} accessibilityLabel="day">
            {formattedStartDate}
          </Text>
          <View style={styles.dotIcon}>
            <Ionicons name="md-ellipse" size={5} color="grey" />
          </View>
          <Text style={styles.infoText} accessibilityLabel="time">
            {event.dateRange.formattedStartTime()}
          </Text>
        </View>

        <View style={[styles.flexRow]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicon
              name="location-outline"
              color={event.color}
              style={styles.icon}
            />
          </View>
          <Text style={styles.infoText}>
            {event.placemark
              ? placemarkToAbbreviatedAddress(event.placemark)
              : "Unknown Address"}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  topRow: {
    paddingBottom: 12,
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
    fontSize: 14,
    fontFamily: "OpenSans",
    color: ButtonStyles.colorOpacity50
  },
  name: {
    textAlignVertical: "center",
    fontFamily: "OpenSansBold",
    fontSize: 14,
    paddingLeft: 8
  },
  description: {
    fontFamily: "OpenSans",
    fontSize: 13
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 24
  },
  container: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(145, 145, 145, 0.1)"
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
    borderRadius: 12,
    marginRight: 8
  },
  icon: {
    padding: 4
  },
  textColor: {
    color: ButtonStyles.darkColor
  },
  text14px: {
    fontSize: 14,
    fontFamily: "OpenSans",
    color: ButtonStyles.darkColor
  }
})
