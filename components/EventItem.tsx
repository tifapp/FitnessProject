import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider, Icon } from "react-native-elements"
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
  const lightEventColor = tinycolor(event.colorHex).lighten(10).toString()

  const onPressMore = () => {
    return null
  }

  return (
    <Shadow
      distance={5}
      startColor={shadowColor}
      offset={[0, 3]}
      style={{ alignSelf: "stretch" }}
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
            <Icon name="location-on" color={event.colorHex} />
            <Text style={styles.infoText}>
              {placemarkToFormattedAddress(event.address)}
            </Text>
          </View>

          <View style={styles.flexRow}>
            <Icon name="event-available" color={event.colorHex} />
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
            <Icon name="people-alt" color={event.colorHex} />
            <Text
              style={[styles.attendingText, styles.attendingNumber]}
            >{`${numAttendees}`}</Text>
            <Text style={styles.attendingText}>{" attending"}</Text>
          </View>

          <Shadow distance={4} startColor={shadowColor} offset={[0, 1]}>
            <View
              style={[
                styles.distance,
                {
                  backgroundColor: event.colorHex,
                  borderColor: lightEventColor
                }
              ]}
            >
              <Icon name="near-me" size={20} color="white" />
              <Text style={styles.distanceText}>{`${distance} mi`}</Text>
            </View>
          </Shadow>
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
    alignItems: "flex-end"
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: "3%",
    borderRadius: 14,
    borderWidth: 3
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
    paddingHorizontal: "6%",
    paddingVertical: "3%",
    borderRadius: 20
  }
})

export default EventItem
