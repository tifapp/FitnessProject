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
      <View style={styles.topRow}>
        <Text style={styles.name}>{event.username}</Text>

        <IconButton iconName={"more-horiz"} style={styles.moreButtonStyle} />
      </View>
      <View style={styles.middleRow}>
        <Text style={styles.titleText}>{event.title}</Text>
        <View style={styles.location}>
          <Icon name="location-on" color={event.colorHex} />
          <Text style={styles.infoText}>{event.address}</Text>
        </View>
        <View style={styles.time}>
          <Icon name="event-available" color={event.colorHex} />
          <Text style={styles.infoText}>{event.address}</Text>
        </View>
        <View style={{ paddingVertical: "4%" }}>
          <Divider style={{ height: 1 }} />
        </View>
        <View style={styles.bottomRow}>
          <Icon name="people-alt" color={event.colorHex} />
          <Text
            style={styles.attendingText}
          >{`${numAttendees} attending`}</Text>
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
    flex: 1,
    flexDirection: "row",
    paddingBottom: "4%"
    // borderColor: "purple",
    // borderWidth: 2
  },
  middleRow: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: "2%"
    // borderColor: "blue",
    // borderWidth: 2
  },
  location: {
    flex: 1,
    flexDirection: "row",
    paddingBottom: "2%"
    // borderColor: "orange",
    // borderWidth: 2
  },
  time: {
    flex: 1,
    flexDirection: "row"
    // borderColor: "green",
    // borderWidth: 2
  },
  bottomRow: {
    flex: 1,
    flexDirection: "row"
    // borderColor: "yellow",
    // borderWidth: 2
  },
  infoText: {
    textAlignVertical: "center",
    color: "grey"
  },
  attendingText: {
    textAlignVertical: "center",
    fontWeight: "bold"
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
    fontSize: 14
  },
  moreButtonStyle: {
    flex: 1,
    alignItems: "flex-end"
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
    elevation: 1,
    borderColor: "red",
    borderWidth: 2
  }
})

export default React.memo(EventItem)
