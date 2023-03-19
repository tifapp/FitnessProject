import { MaterialCommunityIcon } from "@components/common/Icons"
import MenuDropdown from "@components/eventCard/MenuDropdown"
import { placemarkToFormattedAddress } from "@lib/location"
import { Event } from "@lib/events"
import React from "react"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"

interface Props {
  event: Event
}

const EventDetails = ({ event }: Props) => {
  const hexAlpha = "33"
  return (
    <View style={styles.container}>
      <View style={[styles.viewSpacing, { flex: 1 }]}>
        <View style={styles.viewSpacing}>
          <View style={styles.flexRow}>
            <Text style={styles.titleText}>{event.title}</Text>
            <View style={styles.topRowButtons}>
              <View style={styles.topRowButtonStyle}>
                <MenuDropdown
                  isEventHost={event.userAttendeeStatus === "hosting"}
                />
              </View>
              <MaterialCommunityIcon
                name="close"
                style={styles.topRowButtonStyle}
              />
            </View>
          </View>
          <View style={styles.flexRow}>
            <Image
              style={[styles.image, styles.iconMargin]}
              source={require("../../assets/icon.png")}
              accessibilityLabel="profile picture"
            />
            <Text style={styles.name}>{event.host.username}</Text>
          </View>
        </View>
        <View style={[styles.viewSpacing]}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="account-multiple-outline"
              color={event.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.color + hexAlpha }
              ]}
            />
            <Text
              style={styles.details}
            >{`${event.attendeeCount} Attending`}</Text>
          </View>
          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="calendar-check-outline"
              color={event.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.color + hexAlpha }
              ]}
            />
            <View>
              <Text style={styles.details}>
                {event.dateRange.formattedDate()}
              </Text>
              <Text>{event.dateRange.formattedTime()}</Text>
            </View>
          </View>
          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="map-marker-outline"
              color={event.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.color + hexAlpha }
              ]}
            />
            <View>
              <Text style={styles.details}>{event.title}</Text>
              <Text>
                {event.placemark
                  ? placemarkToFormattedAddress(event.placemark)
                  : "Unknown Address"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.viewSpacing}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text>{event.description}</Text>
        </View>
        {event.userAttendeeStatus !== "attending"
          ? (
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.buttonStyle, { backgroundColor: event.color }]}
              >
                <Text style={[styles.buttonText, { color: "white" }]}>
                Join Now
                </Text>
              </Pressable>
            </View>
          )
          : (
            <View style={styles.buttonContainer}>
              <Pressable style={[styles.buttonStyle, styles.leaveEvent]}>
                <Text style={[styles.buttonText, { color: "black" }]}>
                Leave Event
                </Text>
              </Pressable>
              <Pressable
                style={[styles.buttonStyle, { backgroundColor: event.color }]}
              >
                <Text style={[styles.buttonText, { color: "white" }]}>
                Event Chat
                </Text>
              </Pressable>
            </View>
          )}
      </View>
    </View>
  )
}

export default EventDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  flexRow: {
    flexDirection: "row"
  },
  titleText: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 22,
    // borderWidth: 1,
    marginBottom: 8
  },
  titleRow: {
    // flex: 1,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "red",
    alignItems: "center"
  },
  image: {
    width: 35,
    height: 35,
    borderRadius: 24
  },
  iconMargin: {
    marginRight: 16
  },
  viewSpacing: {
    marginVertical: 16,
    marginHorizontal: 12
    // flex: 1,
    // borderWidth: 2
  },
  name: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8
  },
  sectionSpacing: {
    marginBottom: 8
  },
  details: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15
  },
  detailIcons: {
    padding: 3,
    borderRadius: 20
  },
  topRowButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  topRowButtonStyle: {
    backgroundColor: "rgba(145, 145, 145, 0.3)",
    borderRadius: 20,
    marginLeft: 16
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end"
  },
  buttonStyle: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "green",
    marginHorizontal: 12
  },
  leaveEvent: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(145, 145, 145, 0.3)"
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16
  }
})
