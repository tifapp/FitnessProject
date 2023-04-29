import { CurrentUserEvent, isAttendingEvent } from "@lib/events"
import React, { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { BodyText, Caption, Headline, Title } from "@components/Text"
import ExpandableText from "@screens/EventDetails/ExpandableText"
import { Divider } from "react-native-elements"
import EventMapSnippet from "./EventMapSnippet"
import TimeSection from "./TimeSection"
import LocationSection from "./LocationSection"
import AttendeeSection from "./AttendeeSection"
import ChatSection from "./ChatSection"
import { OutlinedButton, PrimaryButton } from "@components/common/Buttons"
import { CalendarEvent } from "@lib/Calendar"
import { EventMapDetails, openMap} from "@lib/ExternalMap"
import Toast from "react-native-root-toast"
import { ButtonStyles } from "@lib/ButtonStyle"

export type EventDetailsProps = {
  event: CurrentUserEvent
}

const MARKER_SIZE = 44
const BOTTOM_TAB_HEIGHT = 80

const EventDetails = ({ event }: EventDetailsProps) => {
  const isFriend = false
  const [requestSent, setRequestSent] = useState(isFriend)
  const calenderEvent: CalendarEvent = {
    duration: event.dateRange,
    id: event.id,
    description: event.description!,
    coordinates: event.coordinates,
    title: event.title,
    bottomTabHeight: BOTTOM_TAB_HEIGHT
  }
  const mapDetails: EventMapDetails = {
    coordinates: event.coordinates,
    placemark: event.placemark
  }

  const sendFriendRequest = () => {
    setRequestSent(true)
  }

  const openMapWithoutDirections = () => {
    openMap(mapDetails)
  }

  return (
    <View>
      <ScrollView
        style={[styles.container, styles.spacing]}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <Title style={styles.textColor}>{event.title}</Title>
        <View style={[styles.flexRow, { marginVertical: 16 }]}>
          <Image
            style={[styles.image]}
            source={require("../../assets/icon.png")}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.flexRow}>
              <Headline style={styles.textColor}>{event.host.username}</Headline>
              {!isFriend && 
                !requestSent ? (
                  <View style={[styles.flexRow, { alignItems: "center" }]}>
                    <Ionicons
                      style={{ marginHorizontal: 8 }}
                      size={6}
                      color={ButtonStyles.colorOpacity35}
                      name="ellipse"
                    />
                    <Headline onPress={sendFriendRequest} style={{ color: event.color }}>Add Friend</Headline>
                  </View>
                )
                : (
                  <View style={[styles.flexRow, { alignItems: "center" }]}>
                    <Ionicons
                      style={{ marginHorizontal: 8 }}
                      color={ButtonStyles.colorOpacity35}
                      size={6}
                      name="ellipse"
                    />
                    <Headline onPress={sendFriendRequest} style={{ color: ButtonStyles.colorOpacity35 }}>Request Sent</Headline>
                  </View>
                )
              }
              
            </View>
            <Caption style={styles.textColor}>{event.host.handle}</Caption>
          </View>
        </View>

        <View style={styles.iconSection}>
          <TimeSection color={event.color} event={calenderEvent} />

          <Divider style={styles.divider} />

          <LocationSection
            color={event.color}
            coordinates={event.coordinates}
            placemark={event.placemark}
            bottomTabHeight={BOTTOM_TAB_HEIGHT}
          />

          <Divider style={styles.divider} />

          <AttendeeSection
            color={event.color}
            attendeeCount={event.attendeeCount}
          />

          <Divider style={styles.divider} />

          <ChatSection
            color={event.color}
            userAttendeeStatus={event.userAttendeeStatus}
          />
        </View>

        {event.description && (
          <View style={{ marginTop: 16 }}>
            <Headline style={[styles.textColor, {marginBottom: 4 }]}>About</Headline>
            <ExpandableText
              props={{ style: { color: event.color, marginTop: 5 } }}
              text={event.description}
              linesToDisplay={3}
            />
          </View>
        )}
        <View style={{ marginTop: 16, marginBottom: BOTTOM_TAB_HEIGHT + 24 }}>
          <Headline style={[styles.textColor, { marginBottom: 8 }]}>Location</Headline>
          <TouchableOpacity
            style={{
              borderRadius: 12,
              overflow: "hidden"
            }}
            onPress={openMapWithoutDirections}
          >
            <EventMapSnippet
              style={{ width: "100%", height: 160 }}
              minZoomLevel={12}
              initialRegion={{
                latitude: event.coordinates.latitude,
                longitude: event.coordinates.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
              }}
              renderMarker={() => (
                <Image
                  source={require("../../assets/icon.png")}
                  style={{
                    width: MARKER_SIZE,
                    height: MARKER_SIZE,
                    borderWidth: 1,
                    borderColor: "white",
                    borderRadius: 20
                  }}
                />
              )}
              marker={{ key: event.id, location: event.coordinates }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.bottomTab}>
        {isAttendingEvent(event.userAttendeeStatus)
          ? (
            <OutlinedButton
              title={"Leave Event"}
              buttonProps={{ style: styles.buttonStyle }}
            />
          )
          : (
            <PrimaryButton
              title={"Join Now"}
              buttonProps={{ style: styles.buttonStyle }}
            />
          )}
      </View>
      <Toast
        visible={requestSent}
        opacity={1}
        position={Toast.positions.BOTTOM - BOTTOM_TAB_HEIGHT}
        shadow={false}
        animation={true}
        hideOnPress={true}
        containerStyle={styles.toastStyle}
      >
        <View style={styles.flexRow}>
          <View style={{marginRight: 16}}>
            <Ionicons style={{color: "white"}} name="close" size={24}/>
          </View>
          <BodyText style={{color: "white", textAlignVertical: "center"}}>
            {"Friend request sent"}
          </BodyText>
        </View>
      </Toast>
    </View>
  )
}

export default EventDetails

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: "white"
  },
  flexRow: {
    flexDirection: "row"
  },
  spacing: {
    paddingHorizontal: 16
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 16,
    borderRadius: 20
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: 16
  },
  divider: {
    marginVertical: 16,
    width: "80%",
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  },
  bottomTab: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_TAB_HEIGHT,
    backgroundColor: "white"
  },
  buttonStyle: {
    flex: 1,
    marginHorizontal: 16
  },
  toastStyle: {
    borderRadius: 12,
    width: '90%',
    backgroundColor: ButtonStyles.darkColor,
    alignItems: "flex-start"
  },
  textColor: {
    color: ButtonStyles.darkColor
  }
})
