import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider, Icon } from "react-native-elements"
import { daysBeforeEvent, displayTimeOfEvent } from "@lib/time/Time"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const numAttendees = 0

  return (
    <View style={[styles.container]}>
      {/* Profile Image, Name, More button */}
      <View style={[styles.topRow, styles.flexRow]}>
        <Text style={styles.name}>{event.username}</Text>

        <IconButton
          iconName={"more-horiz"}
          style={styles.moreButtonStyle}
          size={26}
        />
      </View>

      {/* Event Title, Location, Time */}
      <View style={styles.middleRow}>
        <Text style={styles.titleText}>{event.title}</Text>

        <View style={[styles.location, styles.flexRow]}>
          <Icon name="location-on" color={event.colorHex} />
          <Text style={styles.infoText}>{event.address}</Text>
        </View>

        <View style={styles.flexRow}>
          <Icon name="event-available" color={event.colorHex} />
          <Text style={styles.infoText}>
            {daysBeforeEvent(event.startTime, new Date())}
          </Text>
          <Text style={styles.infoText}>
            {displayTimeOfEvent(event.startTime, event.endTime)}
          </Text>
        </View>

        <View style={{ paddingVertical: "4%" }}>
          <Divider style={{ height: 1 }} />
        </View>
      </View>

      {/* People Attending, Distance */}
      <View style={styles.flexRow}>
        <Icon name="people-alt" color={event.colorHex} />
        <Text
          style={[styles.attendingText, styles.attendingNumber]}
        >{`${numAttendees}`}</Text>
        <Text style={styles.attendingText}>{" attending"}</Text>

        <View style={styles.distanceContainer}>
          <View style={[styles.distance, { backgroundColor: event.colorHex }]}>
            <Icon name="near-me" size={22} color="white" />
            <Text style={styles.distanceText}>{`${event.distance} mi`}</Text>
          </View>
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
    paddingBottom: "4%"
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
    paddingLeft: "3%"
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
    fontSize: 15
  },
  moreButtonStyle: {
    flex: 1,
    alignItems: "flex-end"
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "white"
  },
  distanceContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  distanceText: {
    textAlignVertical: "center",
    color: "white",
    paddingLeft: "3%"
  },
  container: {
    backgroundColor: "white",
    shadowColor: "#000",
    paddingHorizontal: "6%",
    paddingVertical: "3%",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
    // borderRadius: 28
  }
})

export default React.memo(EventItem)
