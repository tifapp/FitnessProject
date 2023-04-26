import { CurrentUserEvent } from "@lib/events"
import React from "react"
import { Ionicons } from "@expo/vector-icons"
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { Caption, Headline, Title } from "@components/Text"
import ExpandableText from "@screens/EventDetails/ExpandableText"
import { Divider } from "react-native-elements"
import EventMapSnippet from "./EventMapSnippet"
import TimeSection from "./TimeSection"
import LocationSection from "./LocationSection"
import AttendeeSection from "./AttendeeSection"
import ChatSection from "./ChatSection"

export type EventDetailsProps = {
  event: CurrentUserEvent
}

const MARKER_SIZE = 44

const EventDetails = ({ event }: EventDetailsProps) => {
  const isFriend = false

  return (
    <ScrollView
      style={[styles.container, styles.spacing]}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled={true}
    >
      <Title>{event.title}</Title>
      <View style={[styles.flexRow, { marginVertical: 16 }]}>
        <Image
          style={[styles.image]}
          source={require("../../assets/icon.png")}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.flexRow}>
            <Headline>{event.host.username}</Headline>
            {!isFriend && (
              <View style={[styles.flexRow, { alignItems: "center" }]}>
                <Ionicons
                  style={{ marginHorizontal: 4 }}
                  size={6}
                  name="ellipse"
                />
                <Headline style={{ color: event.color }}>Add Friend</Headline>
              </View>
            )}
          </View>
          <Caption>{event.host.handle}</Caption>
        </View>
      </View>

      <View style={styles.iconSection}>
        <TimeSection color={event.color} duration={event.dateRange} />

        <Divider style={styles.divider} />

        <LocationSection
          color={event.color}
          coordinates={event.coordinates}
          placemark={event.placemark}
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
      <Headline style={{ marginTop: 16, marginBottom: 8 }}>Location</Headline>
      <EventMapSnippet
        style={{ width: "100%", height: 160, marginBottom: 16 }}
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

      <Text>{event.description}</Text>
      <Text>{event.description}</Text>
      <Text>{event.description}</Text>
    </ScrollView>
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
    backgroundColor: "#0000000D",
    borderRadius: 8,
    paddingVertical: 16
  },
  divider: {
    marginVertical: 16,
    width: "80%",
    height: 1,
    alignSelf: "flex-end"
  },
  bottomTab: {
    // position: "absolute",
    backgroundColor: "yellow",
    bottom: 0
  }
})
