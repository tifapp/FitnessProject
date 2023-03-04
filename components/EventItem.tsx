import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider } from "react-native-elements"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Shadow } from "react-native-shadow-2"
import tinycolor from "tinycolor2"
import { placemarkToFormattedAddress } from "@lib/location"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const numAttendees = 1 // Eventually will come from event object
  const distance = 0.5 // Eventually will be calculated from the location given in the event object
  const shadowColor = "#ebebeb"
  const lightEventColor = tinycolor(event.colorHex).lighten(30).toString()

  const onPressMore = () => {
    return null
  }

  return (
    <Shadow distance={18} startColor={shadowColor} stretch={true}>
      <View style={[styles.container]}>
        {/* Profile Image, Name, More button */}
        <View style={[styles.topRow, styles.flexRow]}>
          <Image
            style={styles.image}
            source={require("../assets/icon.png")}
            accessibilityLabel="profile picture"
          />
          <Text style={styles.name}>{event.username}</Text>
          <IconButton
            iconName={"more-horiz"}
            style={styles.moreButtonStyle}
            size={26}
            onPress={onPressMore}
          />
        </View>

        {/* Event Title, Location, Time */}
        <View style={styles.middleRow}>
          <Text style={styles.titleText}>{event.title}</Text>

          <View style={[styles.location, styles.flexRow]}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={24}
              color={event.colorHex}
            />
            <Text style={styles.infoText}>
              {placemarkToFormattedAddress(event.address)}
            </Text>
          </View>

          <View style={styles.flexRow}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={24}
              color={event.colorHex}
            />
            <Text style={styles.infoText} accessibilityLabel="day">
              {event.duration.formatted()}
            </Text>
          </View>

          <View style={{ marginVertical: 12 }}>
            <Divider style={{ height: 1 }} />
          </View>
        </View>

        {/* People Attending, Distance */}
        <View style={styles.distanceContainer}>
          <View style={[styles.flexRow, { alignItems: "center" }]}>
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={24}
              color={event.colorHex}
            />
            <Text
              style={[styles.attendingText, styles.attendingNumber]}
            >{`${numAttendees}`}</Text>
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
            <MaterialCommunityIcons
              name="navigation-variant-outline"
              size={22}
              color={event.colorHex}
            />
            <Text
              style={[styles.distanceText, { color: event.colorHex }]}
            >{`${distance} mi`}</Text>
          </View>
        </View>
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
    paddingBottom: 8,
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
    color: "grey",
    paddingLeft: 8
  },
  attendingNumber: {
    fontWeight: "bold",
    paddingLeft: 8
  },
  attendingText: {
    textAlignVertical: "center",
    fontSize: 14
  },
  titleText: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 22,
    paddingBottom: 8
  },
  name: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15,
    paddingLeft: 8
  },
  moreButtonStyle: {
    flex: 1,
    opacity: 0.4,
    alignItems: "flex-end"
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 2,
    paddingLeft: 4,
    borderRadius: 14
  },
  distanceContainer: {
    flexDirection: "row"
  },
  distanceText: {
    textAlignVertical: "center",
    color: "white",
    paddingRight: 8,
    paddingLeft: 2,
    fontWeight: "bold"
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 24
  },
  container: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20
  }
})

export default EventItem
