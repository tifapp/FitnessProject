import { MaterialCommunityIcon } from "@components/common/Icons"
import MenuDropdown from "@components/eventCard/MenuDropdown"
import { placemarkToAbbreviatedAddress, placemarkToFormattedAddress } from "@lib/location"
import { CurrentUserEvent, isAttendingEvent, isHostingEvent } from "@lib/events"
import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { BodyText, Caption, Headline, Title } from "@components/Text"
import dayjs from "dayjs"
import ExpandableText from "@components/common/ExpandableText"
import { Divider } from "react-native-elements"

export type EventDetailsProps = {
  event: CurrentUserEvent
}

const EventDetails = ({ event }: EventDetailsProps) => {
  const hexAlpha = "26"
  const lightEventColor = event.color + hexAlpha
  const eventDuration = event.dateRange
  const startTimeFormat = dayjs(eventDuration.startDate).format("h A")
  const endTimeFormat = dayjs(eventDuration.endDate).format("h A")
  const isFriend = false
  return (
    <ScrollView style={[styles.container, styles.spacing]}>
     <Title>{event.title}</Title>
     <View style={[styles.flexRow, {marginVertical: 16}]}>
        <Image 
          style={[styles.image]}
          source={require("../../assets/icon.png")}
        />
        <View style={{flex: 1}}>
          <View style={styles.flexRow}>
            <Headline>{event.host.username}</Headline>
            {!isFriend ? 
              <View style={[styles.flexRow, {alignItems: "center"}]}>
                <Ionicons style={{marginHorizontal: 4}} size={6} name="ellipse"/>
                <Headline style={{color: event.color}}>Add Friend</Headline>
              </View>
            : null
            }
          </View>
          <Caption>{event.host.handle}</Caption>
        </View>
     </View>

      <View style={styles.iconSection}>
        <View style={[styles.flexRow, styles.paddingIconSection]}>
          <View style={{justifyContent: "center"}}>
            <Ionicons 
              style={[styles.iconStyling, {backgroundColor: event.color}]}
              name="calendar"
              color={"white"}
              size={24} />
          </View>
          <View style={styles.spacing}>
            {
              eventDuration.endSameDay() ?
              <View style={{marginBottom: 4}}>
                <Headline>{`${eventDuration.formattedStartDate()}`}</Headline>
                <Caption>{`from ${startTimeFormat} - ${endTimeFormat}`}</Caption>
              </View> :
              <View style={{marginBottom: 4}}>
                <Headline>{`From ${eventDuration.formattedStartDate()}, ${startTimeFormat}`}</Headline>
                <Caption>{`to ${eventDuration.formattedStartDate()}, ${eventDuration.formattedStartTime()}`}</Caption>
              </View>
            }
            <Caption style={[{color: event.color}, styles.captionLinks]}>Add to Calendar</Caption>
          </View> 
        </View>

        <Divider style={styles.divider}/>

        <View style={[styles.flexRow, styles.paddingIconSection]}>
          <View style={{justifyContent: "center"}}>
            <Ionicons
              style={[styles.iconStyling, {backgroundColor: event.color}]}
              name="location"
              color={"white"}
              size={24}/>
          </View>
          {event.placemark ?
            <View style={styles.spacing}>
                <View style={{marginBottom: 4}}> 
                  <Headline>{event.placemark?.name}</Headline>
                  <View style={styles.flexRow}>
                    {event.placemark?.streetNumber && <Caption>{`${event.placemark?.streetNumber} `}</Caption>}
                    {event.placemark?.street && <Caption>{`${event.placemark?.street}, `}</Caption>}
                    {event.placemark?.city && <Caption>{`${event.placemark?.city}, `}</Caption>}
                    {event.placemark?.region && <Caption>{`${event.placemark?.region}`}</Caption>}
                  </View>
                </View>
                <View style={styles.flexRow}>
                  <Caption style={[{color: event.color, marginRight: 16}, styles.captionLinks]}>Copy Address</Caption>
                  <Caption style={[{color: event.color}, styles.captionLinks]}>Directions</Caption>
                </View>
            </View> : <Headline style={styles.spacing}>Unknown Location</Headline>
          }
        </View>

        <Divider style={styles.divider}/>

        <View style={[styles.flexRow, styles.paddingIconSection]}>
          <View style={{justifyContent: "center"}}>
            <Ionicons
              style={[styles.iconStyling, {backgroundColor: event.color}]}
              name="people"
              color={"white"}
              size={24}/>
          </View>
          <View style={styles.spacing}>
            <Headline>{`${event.attendeeCount} Attending`}</Headline>
            <Caption>View all attendees</Caption>
          </View>
          <View style={[styles.flexRow, {justifyContent: "flex-end"}]}>
            <Ionicons
              name="chevron-forward"
              size={20}
              style={{alignSelf: "center", opacity: 0.3}}
            />
          </View>
        </View>

        <Divider style={styles.divider}/>

        <View style={[styles.flexRow, styles.paddingIconSection]}>
          <View style={{justifyContent: "center"}}>
            <Ionicons
              style={[styles.iconStyling, {backgroundColor: event.color}]}
              name="chatbox-ellipses"
              color={"white"}
              size={24}/>
          </View>
          <View style={styles.spacing}>
            <Headline>Event Chat</Headline>
            {isAttendingEvent(event.userAttendeeStatus) ?
              <Caption>View the chat</Caption> :
              <Caption>Join this event to access the chat</Caption>
            }
          </View>
        </View>
      </View>

      {event.description && 
        <View style={{marginTop: 16}}>
          <Headline style={{marginBottom: 4}}>About</Headline>
          <ExpandableText props={{style: {color: event.color, marginTop: 10}}} text={event.description} linesToDisplay={3} />
        </View>
      }
    </ScrollView>
  )
}

export default EventDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: "white"
  },
  flexRow: {
    flex: 1,
    flexDirection: "row"
  },
  spacing: {
    paddingHorizontal: 16
  },
  image: {
    width: 32,
    height: 32,
    marginRight: 16,
    borderRadius: 20
  },
  iconSection: {
    backgroundColor: "#0000000D",
    borderRadius: 8,
    paddingVertical: 16
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  divider: {
    marginVertical: 16,
    width: "80%",
    height: 1,
    alignSelf: "flex-end"
  },
  paddingIconSection: {
    paddingHorizontal: 16
  },
  iconStyling: {
    padding: 6,
    borderRadius: 12, 
  }
})
