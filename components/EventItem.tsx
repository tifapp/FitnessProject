import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider, Icon } from "react-native-elements"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const numAttendees = 0
  /*
  const [isMin, setIsMin] = useState(false) // If time limit has <> 1 hour left
  const [isHours, setIsHours] = useState(false) // If time limit has >= 1 hour left
  const [isDays, setIsDays] = useState(false) // // If time limit has > 24 hours left
  const [timeUntil, setTimeUntil] = useState(0) // Time (in either days, hours, or minutes) until event starts
  const [currentCapacity, setCurrentCapacity] = useState(1) // How many users have joined event
  const CAPACITY_PERCENTAGE = 0.75

  const setTime = () => {
    if (event.startTime) {
      const date = new Date()
      const diffTime = Math.abs(event.startTime.getTime() - date.getTime())
      const diffMin = Math.ceil(diffTime / (1000 * 60))
      const diffHours = Math.floor(diffMin / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMin < 60) {
        setIsMin(true)
        setIsHours(false)
        setIsDays(false)
        setTimeUntil(diffMin)
      } else if (diffHours < 24) {
        setIsMin(false)
        setIsHours(true)
        setIsDays(false)

        if (diffMin % 60 >= 20 && diffMin % 60 <= 40) {
          setTimeUntil(diffHours + 0.5)
        } else {
          setTimeUntil(diffHours)
        }
      } else {
        setIsMin(false)
        setIsDays(true)
        setIsHours(false)
        setTimeUntil(diffDays)
      }
    }
  }

  useEffect(() => {
    setTime()
  }, [event.startTime])

  const displayTime = () => {
    if (isDays) {
      return `${timeUntil}d`
    } else if (isHours) {
      if (timeUntil === 1) {
        return `${timeUntil}hr`
      } else {
        return `${timeUntil}hrs`
      }
    } else {
      return `${timeUntil}min`
    }
  }
*/
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
          <Text style={styles.infoText}>{event.address}</Text>
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
