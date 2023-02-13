import React, { useState, useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Event } from "@lib/events/Event"
import IconButton from "./common/IconButton"
import { Divider, Icon } from "react-native-elements"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const [requested, setRequested] = useState(false) // If user has requested to join
  const [numInvitations, setNumInvitations] = useState(0) // Number of requested invitations
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

  const handleRequestToJoin = () => {
    if (requested) {
      setRequested(false)
      setNumInvitations(numInvitations - 1)
    } else {
      setRequested(true)
      setNumInvitations(numInvitations + 1)
    }
  }

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

  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={[styles.nestedReply]}>
        {/* Header (Event Icon, Event Title, Distance) */}
        <View style={[styles.flexRow, styles.eventContainerStyle]}>
          <View style={[styles.spacingTop, { paddingLeft: "3%" }]}>
            <Icon name="location-pin" style={{ color: event.color }} />
          </View>
          <Text
            style={[styles.eventTitle, styles.spacingTop]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
          <Text style={[styles.distance, styles.spacingTop]}>
            {event.distance} mi
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Bottom Left Icons (time until event, max occupancy) */}
        <View style={[styles.flexRow, { paddingVertical: "3%" }]}>
          <View style={[styles.flexRow, { paddingLeft: "3%" }]}>
            {event.startTime != null
              ? (
              <View
                style={{ flexDirection: "row" }}
                accessibilityLabel={"time until"}
              >
                <View style={styles.alignIcon}>
                  {isHours || isMin
                    ? (
                    <Icon
                      name="access-time"
                      size={20}
                      style={{ color: isHours ? "grey" : "red" }}
                      accessibilityLabel={"time icon"}
                    />
                      )
                    : (
                    <Icon
                      name="date-range"
                      size={20}
                      color={"grey"}
                      accessibilityLabel={"time icon"}
                    />
                      )}
                </View>
                <Text
                  style={[
                    styles.numbersBottomLeft,
                    { color: isHours || isDays ? "grey" : "red" },
                    { paddingHorizontal: "1%" }
                  ]}
                >
                  {displayTime()}
                </Text>
              </View>
                )
              : null}
            {event.startTime && event.maxOccupancy != null
              ? (
              <View style={styles.eventDot}>
                <Icon name="lens" size={7} color={"grey"} />
              </View>
                )
              : null}
            {event.maxOccupancy
              ? (
              <View
                style={styles.maxLimit}
                accessibilityLabel={"max occupancy"}
              >
                <View style={styles.alignIcon}>
                  <Icon
                    name="person-outline"
                    size={24}
                    style={{
                      color:
                        currentCapacity >=
                        Math.floor(event.maxOccupancy * CAPACITY_PERCENTAGE)
                          ? "red"
                          : "grey"
                    }}
                    accessibilityLabel={"occupancy icon"}
                  />
                </View>
                <Text
                  style={[
                    styles.numbersBottomLeft,
                    {
                      color:
                        currentCapacity >=
                        Math.floor(event.maxOccupancy * CAPACITY_PERCENTAGE)
                          ? "red"
                          : "grey"
                    }
                  ]}
                >
                  {currentCapacity}/{event.maxOccupancy}
                </Text>
              </View>
                )
              : null}
          </View>

          {/* Bottom Right Icons (invitations, comments, more tab) */}
          <View style={styles.iconsBottomRight}>
            {event.hasInvitations
              ? (
              <View
                style={styles.iconsBottomRight}
                accessibilityLabel={"request invitations"}
              >
                <IconButton
                  style={{ paddingRight: "14%" }}
                  iconName={"person-add"}
                  size={24}
                  color={requested ? event.color : "black"}
                  onPress={handleRequestToJoin}
                  accessibilityLabel={"invitation icon"}
                  label={`${numInvitations > 0 ? numInvitations : ""}`}
                  isLabelFirst={true}
                  textStyle={styles.numbersBottomRight}
                />
              </View>
                )
              : null}
            <IconButton
              style={{ paddingRight: "5%" }}
              iconName={"messenger"}
              size={18}
              color={"black"}
              onPress={() => null}
              accessibilityLabel={"comments icon"}
              label={`${event.repliesCount}`}
              isLabelFirst={true}
              textStyle={styles.numbersBottomRight}
            />
            <IconButton
              style={{ paddingLeft: "3%" }}
              iconName={"more-vert"}
              size={24}
              color={"black"}
              onPress={() => null}
              accessibilityLabel={"more icon"}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default React.memo(EventItem)

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#f7f7f7"
  },
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  spacingTop: {
    paddingTop: "2%"
  },
  eventContainerStyle: {
    paddingBottom: "3%",
    paddingTop: "1%"
  },
  eventTitle: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
    paddingLeft: "1%",
    fontSize: 18,
    color: "grey"
  },
  distance: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
    textAlign: "right",
    paddingRight: "4%",
    fontSize: 18,
    color: "grey"
  },
  divider: {
    width: "92%",
    height: 1,
    alignSelf: "center"
  },
  description: {
    paddingBottom: "3%",
    paddingTop: "2%"
  },
  iconsBottomRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  numbersBottomRight: {
    textAlignVertical: "center",
    textAlign: "right",
    fontSize: 16
  },
  alignIcon: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: "2%"
  },
  eventDot: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "1%",
    paddingHorizontal: "1.5%"
  },
  profile: {
    flexDirection: "row",
    paddingLeft: "3%",
    paddingTop: "2%"
  },
  maxLimit: {
    flexDirection: "row"
  },
  numbersBottomLeft: {
    textAlignVertical: "center",
    fontSize: 16
  },
  nestedReply: {
    marginBottom: "4%",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  }
})
