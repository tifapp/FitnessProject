import { MaterialCommunityIcon } from "@components/common/Icons"
import MenuDropdown from "@components/eventCard/MenuDropdown"
import { Event, HostedEvent } from "@lib/events"
import { placemarkToFormattedAddress } from "@lib/location"
import React from "react"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"

interface Props {
  event: HostedEvent
}

const EventDetails = ({ event }: Props) => {
  const hexAlpha = "33"
  return (
    <View style={styles.container}>
      <View style={[styles.viewSpacing, { flex: 1 }]}>
        {/* Event Title, profile image, name */}
        <View style={styles.viewSpacing}>
          <View style={styles.flexRow}>
            <Text style={styles.titleText}>{event.details.title}</Text>

            <View style={styles.topRowButtons}>
              <View style={styles.topRowButtonStyle}>
                <MenuDropdown isEventHost={event.isHostedByUser} />
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

        {/* Details: attendees, date, location */}
        <View style={[styles.viewSpacing]}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="account-multiple-outline"
              color={event.details.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.details.color + hexAlpha }
              ]}
            />
            <Text
              style={styles.details}
            >{`${event.details.attendeeCount} Attending`}</Text>
          </View>

          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="calendar-check-outline"
              color={event.details.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.details.color + hexAlpha }
              ]}
            />
            <View>
              <Text style={styles.details}>
                {event.details.dateRange.formattedDate()}
              </Text>
              <Text>{event.details.dateRange.formattedTime()}</Text>
            </View>
          </View>

          <View style={[styles.flexRow, styles.sectionSpacing]}>
            <MaterialCommunityIcon
              name="map-marker-outline"
              color={event.details.color}
              style={[
                styles.iconMargin,
                styles.detailIcons,
                { backgroundColor: event.details.color + hexAlpha }
              ]}
            />
            <View>
              <Text style={styles.details}>
                {event.details.placemark?.name}
              </Text>
              <Text>
                {event.details.placemark
                  ? placemarkToFormattedAddress(event.details.placemark)
                  : "Unknown Address"}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.viewSpacing}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text>{event.details.description}</Text>
        </View>

        {event.isUserAttending
          ? (
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.buttonStyle,
                  { backgroundColor: event.details.color }
                ]}
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
                style={[
                  styles.buttonStyle,
                  { backgroundColor: event.details.color }
                ]}
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
