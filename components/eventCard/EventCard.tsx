import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { CurrentUserEvent, isHostingEvent } from "@lib/events/Event"
import { Shadow } from "react-native-shadow-2"
import {
  placemarkToAbbreviatedAddress,
  placemarkToFormattedAddress
} from "@lib/location"
import { MaterialCommunityIcon } from "../common/Icons"
import { Ionicons } from "@expo/vector-icons"
import MenuDropdown from "./MenuDropdown"

export type EventCardProps = {
  event: CurrentUserEvent
}

export const EventCard = ({ event }: EventCardProps) => {
  const hexAlpha = "4D"
  const lightEventColor = event.color + hexAlpha
  const shadowColor = "grey"

  return (
    <Shadow
      distance={16}
      offset={[-2, 4]}
      shadowViewProps={{ style: { opacity: 0.25 } }}
      startColor={lightEventColor}
      stretch={true}
    >
      <View style={styles.container}>
        <View style={[styles.topRow, styles.flexRow]}>
          <Image
            style={[styles.image, styles.iconMargin]}
            source={require("../../assets/icon.png")}
            accessibilityLabel="profile picture"
          />
          <Text style={styles.name}>{event.host.username}</Text>
          <View style={styles.moreButtonStyle}>
            <MenuDropdown
              isEventHost={isHostingEvent(event.userAttendeeStatus)}
            />
          </View>
        </View>
        <View style={styles.middleRow}>
          <Text style={styles.titleText}>{event.title}</Text>

          <View style={styles.flexRow}>
            <MaterialCommunityIcon
              name="calendar-check-outline"
              color={event.color}
              style={styles.iconMargin}
            />
            <Text style={styles.infoText} accessibilityLabel="day">
              {event.dateRange.formattedStartDate()}
            </Text>
            <View style={styles.dotIcon}>
              <Ionicons name="md-ellipse" size={5} color="grey" />
            </View>
            <Text style={styles.infoText} accessibilityLabel="time">
              {event.dateRange.formattedStartTime()}
            </Text>
          </View>

          <View style={[styles.location, styles.flexRow]}>
            <MaterialCommunityIcon
              name="map-marker-outline"
              color={event.color}
              style={styles.iconMargin}
            />
            <Text style={styles.infoText}>
              {event.placemark
                ? placemarkToAbbreviatedAddress(event.placemark)
                : "Unknown Address"}
            </Text>
          </View>
        </View>
        {/*
        <View style={{ marginVertical: 16 }}>
          <Divider style={{ height: 1, opacity: 0.4 }} />
        </View>
        <View style={styles.distanceContainer}>
          <View style={[styles.flexRow, { alignItems: "center" }]}>
            <MaterialCommunityIcon
              name="account-multiple-outline"
              color={event.color}
              style={styles.iconMargin}
            />
            <Text
              style={[styles.attendingText, styles.attendingNumber]}
            >{`${event.attendeeCount}`}</Text>
            <Text style={styles.attendingText}>{" attending"}</Text>
          </View>
          <View
            style={[
              styles.distance,
              {
                backgroundColor: lightEventColor
              }
            ]}
          >
            <MaterialCommunityIcon
              name="navigation-variant-outline"
              color={event.color}
              style={styles.iconMargin}
            />
            <Text style={[styles.distanceText, { color: event.color }]}>
              {compactFormatMiles(event.userMilesFromEvent)}
            </Text>
          </View>
          </View> */}
      </View>
    </Shadow>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  topRow: {
    paddingBottom: 16,
    alignItems: "center"
  },
  middleRow: {
    flex: 1,
    flexDirection: "column"
  },
  location: {
    paddingBottom: 8
  },
  infoText: {
    textAlignVertical: "center",
    color: "grey"
  },
  attendingNumber: {
    fontWeight: "bold"
  },
  attendingText: {
    textAlignVertical: "center",
    fontSize: 14
  },
  titleText: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 8
  },
  name: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15,
    paddingLeft: 8
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 2,
    paddingLeft: 4,
    borderRadius: 12
  },
  distanceContainer: {
    flexDirection: "row"
  },
  distanceText: {
    textAlignVertical: "center",
    color: "white",
    paddingRight: 8,
    fontWeight: "bold"
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 24
  },
  container: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(145, 145, 145, 0.1)"
  },
  iconMargin: {
    marginRight: 8
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
  }
})
