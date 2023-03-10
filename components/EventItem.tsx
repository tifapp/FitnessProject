import React, { useState } from "react"
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native"
import { Event } from "@lib/events/Event"
import { Divider } from "react-native-elements"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { Shadow } from "react-native-shadow-2"
import tinycolor from "tinycolor2"
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu"
import { placemarkToFormattedAddress } from "@lib/location"
import { TouchableOpacity } from "react-native-gesture-handler"

interface Props {
  event: Event
}

const EventItem = ({ event }: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const numAttendees = 1 // Eventually will come from event object
  const distance = 0.5 // Eventually will be calculated from the location given in the event object
  const lightEventColor = tinycolor(event.colorHex).lighten(25).toString()
  let dismiss: () => void

  const alertDelete = () => {
    dismissMenu()
    Alert.alert("Delete this event?", undefined, [
      { text: "Delete", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel", onPress: dismiss }
    ])
  }

  // Will probably need to use a modal instead to have user select/type in reason for report
  const alertReport = () => {
    dismissMenu()
    Alert.alert("Report this event?", undefined, [
      { text: "Report", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const editForm = () => {
    console.log("call event form")
  }

  // Show event details screen
  const onPressEvent = () => {
    console.log("test")
  }

  const dismissMenu = () => {
    setMenuOpen(false)
  }
  return (
    <Shadow
      distance={16}
      offset={[-2, 4]}
      shadowViewProps={{ style: { opacity: 0.25 } }}
      startColor={lightEventColor}
      stretch={true}
    >
      <TouchableWithoutFeedback onPress={onPressEvent}>
        <View style={styles.container}>
          {/* Profile Image, Name, More button */}
          <View style={[styles.topRow, styles.flexRow]}>
            <Image
              style={[styles.image, styles.iconMargin]}
              source={require("../assets/icon.png")}
              accessibilityLabel="profile picture"
            />
            <Text style={styles.name}>{event.username}</Text>

            {/* Dropdown menu when more button is pressed */}
            <View style={styles.moreButtonStyle}>
              <Menu
                opened={isMenuOpen}
                onBackdropPress={() => setMenuOpen(false)}
                // style={{ borderWidth: 2, padding: 4 }}
              >
                <MenuTrigger
                  testID="more options"
                  onPress={() => setMenuOpen(true)}
                  customStyles={{
                    TriggerTouchableComponent: TouchableOpacity
                  }}
                  // Increase area where menu is triggered
                  style={{
                    paddingLeft: 16,
                    paddingVertical: 6
                  }}
                >
                  <MaterialIcons name="more-horiz" size={24} />
                </MenuTrigger>
                {/* Need to use Text in order for tests to find the element
                Also need to move the onSelect functions to child in order to test functionality
                */}
                {event.writtenByYou
                  ? (
                    <MenuOptions customStyles={menuOptionsStyles}>
                      <MenuOption>
                        <Text style={{ color: "red" }} onPress={alertDelete}>
                        Delete
                        </Text>
                      </MenuOption>
                      <MenuOption>
                        <Text onPress={editForm}>Edit</Text>
                      </MenuOption>
                    </MenuOptions>
                  )
                  : (
                    <MenuOptions
                      customStyles={{
                        optionsContainer: {
                          width: "30%"
                        }
                      }}
                    >
                      <MenuOption>
                        <Text onPress={alertReport}>Report</Text>
                      </MenuOption>
                    </MenuOptions>
                  )}
              </Menu>
            </View>
          </View>

          {/* Event Title, Location, Time */}
          <View style={styles.middleRow}>
            <Text style={styles.titleText}>{event.title}</Text>

            <View style={[styles.location, styles.flexRow]}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={24}
                color={event.colorHex}
                style={styles.iconMargin}
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
                style={styles.iconMargin}
              />
              <Text style={styles.infoText} accessibilityLabel="day">
                {event.duration.formatted()}
              </Text>
            </View>

            <View style={{ marginVertical: 16 }}>
              <Divider style={{ height: 1, opacity: 0.4 }} />
            </View>
          </View>

          {/* People Attending, Distance */}
          <View style={styles.distanceContainer}>
            <View style={[styles.flexRow, { alignItems: "center" }]}>
              <MaterialCommunityIcons
                name="account-multiple-outline"
                size={24}
                color={event.colorHex}
                style={styles.iconMargin}
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
                size={24}
                color={event.colorHex}
                style={styles.iconMargin}
              />
              <Text
                style={[styles.distanceText, { color: event.colorHex }]}
              >{`${distance} mi`}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Shadow>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  topRow: {
    paddingBottom: 16,
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
    color: "grey"
  },
  attendingNumber: {
    fontWeight: "bold"
  },
  attendingText: {
    textAlignVertical: "center",
    fontSize: 14
  },
  titleText: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 8
  },
  name: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 15
  },
  distance: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 2,
    paddingLeft: 4,
    borderRadius: 12
  },
  distanceContainer: {
    flexDirection: "row"
  },
  distanceText: {
    textAlignVertical: "center",
    color: "white",
    paddingRight: 8,
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
  optionsText: {
    textAlignVertical: "center",
    fontSize: 16
  },
  optionsContainer: {
    width: "30%"
  }
})

const menuOptionsStyles = {
  optionsContainer: styles.optionsContainer,
  optionsText: styles.optionsText
}

export default EventItem
