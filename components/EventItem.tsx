import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider, Icon } from "react-native-elements"
// import Ionicons from "@expo/vector-icons/Ionicons"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Shadow } from "react-native-shadow-2"
import tinycolor from "tinycolor2"
import { placemarkToFormattedAddress } from "@lib/location"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const numAttendees = 1
  const distance = 0.5
  const shadowColor = "#bdbdbd"
  const lightEventColor = tinycolor(event.colorHex).lighten(25).toString()

  const onPressMore = () => {
    return null
  }

  return (
    <Shadow
      distance={20}
      startColor={shadowColor}
      offset={[0, 1]}
      stretch={true}
    >
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

          <View style={{ paddingVertical: "4%" }}>
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
    paddingBottom: "4%",
    alignItems: "center"
  },
  middleRow: {
    flex: 1,
    flexDirection: "column"
  },
  location: {
    paddingBottom: "3%"
  },
  infoText: {
    textAlignVertical: "center",
    color: "grey",
    paddingLeft: "2%"
  },
  attendingNumber: {
    fontWeight: "bold",
    paddingLeft: "5%"
  },
  attendingText: {
    textAlignVertical: "center",
    fontSize: 14
  },
  titleText: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 22,
    paddingBottom: "1%"
  },
  name: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15,
    paddingLeft: "3%"
  },
  moreButtonStyle: {
    flex: 1,
    opacity: 0.3,
    alignItems: "flex-end"
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: "1%",
    paddingLeft: "1%",
    borderRadius: 14
  },
  distanceContainer: {
    flexDirection: "row"
  },
  distanceText: {
    textAlignVertical: "center",
    color: "white",
    paddingRight: "3%",
    paddingLeft: "1%",
    fontWeight: "bold"
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 24
  },
  container: {
    backgroundColor: "white",
    // marginHorizontal: 6,
    paddingHorizontal: "6%",
    paddingVertical: "3%",
    borderRadius: 20
  }
})

export default EventItem
