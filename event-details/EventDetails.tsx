import { Headline, Title } from "@components/Text"
import AttendanceButton from "@components/bottomTabComponents/AttendanceButton"
import ExpandableText from "@components/common/ExpandableText"
import ProfileImageAndNameWithFriend from "@components/profileImageComponents/ProfileImageAndNameWithFriend"
import { CalendarEvent } from "@event-details/Calendar"
import { OpenInMapsRequest, openInMaps } from "@event-details/OpenInMaps"
import { CurrentUserEvent } from "@lib/events"
import React from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import AttendeeSection from "./AttendeeSection"
import ChatSection from "./ChatSection"
import EventMapSnippet from "./EventMapSnippet"
import LocationSection from "./LocationSection"
import TimeSection from "./TimeSection"

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
    title: event.title
  }
  const mapDetails: OpenInMapsRequest = {
    coordinates: event.coordinates,
    placemark: event.placemark
  }

  const openMapWithoutDirections = () => {
    openInMaps(mapDetails)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.contentContainer, styles.spacing]}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <Title>{event.title}</Title>
        <ProfileImageAndNameWithFriend
          imageURL={event.host.profileImageURL}
          username={event.host.username}
          userHandle={event.host.handle}
          eventColor={event.color}
          style={[styles.flexRow, { marginVertical: 24 }]}
          imageStyle={styles.profileImage}
          userFriendStatus="not-friends"
        />
        <View style={styles.iconSection}>
          <TimeSection color={event.color} event={calenderEvent} />
          <LocationSection
            color={event.color}
            coordinates={event.coordinates}
            placemark={event.placemark}
          />
          <AttendeeSection
            color={event.color}
            attendeeCount={event.attendeeCount}
          />
          <ChatSection
            color={event.color}
            userAttendeeStatus={event.userAttendeeStatus}
          />
        </View>

        {event.description && (
          <View style={{ marginTop: 16 }}>
            <Headline style={{ marginBottom: 4 }}>About</Headline>
            <ExpandableText
              style={{ color: event.color, marginTop: 5 }}
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
    position: "relative"
  },
  contentContainer: {
    marginTop: 0,
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
  bottomTabButton: {
    marginHorizontal: MARGIN_SPACING,
    position: "absolute"
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    marginRight: MARGIN_SPACING,
    borderRadius: 20
  }
})
