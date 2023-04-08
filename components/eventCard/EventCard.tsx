import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { CurrentUserEvent, isHostingEvent } from "@lib/events/Event"
import { placemarkToAbbreviatedAddress } from "@lib/location"
import { Ionicons } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import MenuDropdown from "./MenuDropdown"

export type EventCardProps = {
  event: CurrentUserEvent
}

export const EventCard = ({ event }: EventCardProps) => {
  const hexAlpha = "4D"
  const lightEventColor = event.color + hexAlpha

  const [fontsLoaded] = useFonts({
    "Open-Sans": require("../../assets/fonts/OpenSans-Regular.ttf"),
    "Open-Sans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf")
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topRow, styles.flexRow]}>
        <Image
          style={[styles.image, styles.iconMargin]}
          source={require("../../assets/icon.png")}
          accessibilityLabel="profile picture"
        />
        <View>
          <Text style={styles.name}>{event.host.username}</Text>
        </View>
        <View style={styles.moreButtonStyle}>
          <MenuDropdown
            isEventHost={isHostingEvent(event.userAttendeeStatus)}
          />
        </View>
      </View>
      <View style={styles.middleRow}>
        <Text style={[styles.titleText, styles.bottomSpacing]}>
          {event.title}
        </Text>

        <Text
          style={[styles.bottomSpacing, styles.description]}
          numberOfLines={3}
        >
          {event.description}
        </Text>

        <View style={[styles.flexRow, styles.bottomSpacing]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={event.color}
              style={styles.icon}
            />
          </View>
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

        <View style={[styles.flexRow]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicons
              name="location-outline"
              color={event.color}
              size={24}
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
    fontFamily: "Open-Sans",
    color: "grey"
  },
  titleText: {
    textAlignVertical: "center",
    fontFamily: "Open-Sans-Bold",
    fontSize: 16
  },
  name: {
    textAlignVertical: "center",
    fontFamily: "Open-Sans-Bold",
    fontSize: 14,
    paddingLeft: 8
  },
  description: {
    fontFamily: "Open-Sans",
    fontSize: 13
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 24
  },
  container: {
    backgroundColor: "#f5f5f5",
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
  },
  iconContainer: {
    borderRadius: 14,
    marginRight: 16
  },
  icon: {
    margin: 2
  }
})
