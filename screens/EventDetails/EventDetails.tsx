import { CurrentUserEvent } from "@lib/events"
import React from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import { Headline, Title } from "@components/Text"
import ExpandableText from "@screens/EventDetails/ExpandableText"
import { Divider } from "react-native-elements"
import EventMapSnippet from "./EventMapSnippet"
import TimeSection from "./TimeSection"
import LocationSection from "./LocationSection"
import AttendeeSection from "./AttendeeSection"
import ChatSection from "./ChatSection"
import { CalendarEvent } from "@lib/Calendar"
import { NativeEventMapDetails, openInMaps } from "@lib/NativeMap"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import AttendanceButton from "@components/bottomTabComponents/AttendanceButton"

export type EventDetailsProps = {
  event: CurrentUserEvent
}

const MARKER_SIZE = 44
const PROFILE_IMAGE_SIZE = 40
const BOTTOM_TAB_HEIGHT = 80
const MARGIN_SPACING = 16

const EventDetails = ({ event }: EventDetailsProps) => {
  const calenderEvent: CalendarEvent = {
    duration: event.dateRange,
    id: event.id,
    description: event.description!,
    coordinates: event.coordinates,
    title: event.title,
    bottomTabHeight: BOTTOM_TAB_HEIGHT
  }
  const mapDetails: NativeEventMapDetails = {
    coordinates: event.coordinates,
    placemark: event.placemark
  }

  const openMapWithoutDirections = () => {
    openInMaps(mapDetails)
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, styles.spacing]}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <Title>{event.title}</Title>
        <ProfileImageAndName
          displayFriend={true}
          displayHandle={true}
          username={event.host.username}
          userHandle={event.host.handle}
          eventColor={event.color}
          style={[styles.flexRow, { marginVertical: 24 }]}
          imageStyle={styles.profileImage}
          toastOffset={BOTTOM_TAB_HEIGHT}
        />

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
            <Headline style={{ marginBottom: 4 }}>About</Headline>
            <ExpandableText
              props={{ style: { color: event.color, marginTop: 5 } }}
              text={event.description}
              linesToDisplay={3}
            />
          </View>
        )}

        <View style={{ marginTop: 16, marginBottom: BOTTOM_TAB_HEIGHT + 24 }}>
          <Headline style={{ marginBottom: 8 }}>Location</Headline>
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
                  source={require("@assets/icon.png")}
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
      <AttendanceButton
        attendeeStatus={event.userAttendeeStatus}
        style={styles.bottomTabButton}
      />
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
    paddingHorizontal: MARGIN_SPACING
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: MARGIN_SPACING
  },
  divider: {
    marginVertical: 16,
    width: "80%",
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  },
  bottomTabButton: {
    height: BOTTOM_TAB_HEIGHT,
    marginHorizontal: MARGIN_SPACING
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    marginRight: MARGIN_SPACING,
    borderRadius: 20
  }
})
