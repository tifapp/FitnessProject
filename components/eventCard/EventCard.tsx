import React from "react"
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle
} from "react-native"
import { CurrentUserEvent, isHostingEvent } from "@lib/events/Event"
import { placemarkToAbbreviatedAddress } from "@lib/location"
import { Ionicons } from "@expo/vector-icons"
import MenuDropdown from "./MenuDropdown"
import { dayjs, now } from "@lib/date"
import { Ionicon } from "@components/common/Icons"
import { BodyText, Caption, CaptionTitle, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"

export type EventCardProps = {
  event: CurrentUserEvent
  style?: StyleProp<ViewStyle>
} & ViewProps

const IMAGE_SIZE = 32

export const EventCard = ({ event, style }: EventCardProps) => {
  const lightEventColor = event.color + "4D"
  const formattedStartDate = event.dateRange.formattedDate(
    now(),
    dayjs(event.dateRange.startDate)
  )

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.topRow, styles.flexRow]}>
        <ProfileImageAndName
          username={event.host.username}
          userHandle={event.host.handle}
          imageStyle={[styles.image, styles.iconMargin]}
        />

        <View style={styles.moreButtonStyle}>
          <MenuDropdown
            isEventHost={isHostingEvent(event.userAttendeeStatus)}
          />
        </View>
      </View>
      <View style={styles.middleRow}>
        <Headline style={styles.bottomSpacing}>{event.title}</Headline>

        <BodyText style={styles.bottomSpacing} numberOfLines={3}>
          {event.description}
        </BodyText>

        <View style={[styles.flexRow, styles.bottomSpacing]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicon
              name="calendar-outline"
              color={event.color}
              style={styles.icon}
            />
          </View>
          <Caption style={styles.infoText} accessibilityLabel="day">
            {formattedStartDate}
          </Caption>
          <View style={styles.dotIcon}>
            <Ionicons
              name="md-ellipse"
              size={4}
              color={AppStyles.colorOpacity50}
            />
          </View>
          <Caption style={styles.infoText} accessibilityLabel="time">
            {event.dateRange.formattedStartTime()}
          </Caption>
        </View>

        <View style={[styles.flexRow]}>
          <View
            style={[styles.iconContainer, { backgroundColor: lightEventColor }]}
          >
            <Ionicon
              name="location-outline"
              color={event.color}
              style={styles.icon}
            />
          </View>
          <Caption style={styles.infoText}>
            {event.placemark
              ? placemarkToAbbreviatedAddress(event.placemark)
              : "Unknown Address"}
          </Caption>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    // flex: 1,
    flexDirection: "row"
  },
  topRow: {
    paddingBottom: 12,
    alignItems: "center"
  },
  middleRow: {
    flex: 1,
    flexDirection: "column"
  },
  bottomSpacing: {
    marginBottom: 8
  },
  infoText: {
    textAlignVertical: "center",
    textAlign: "center",
    alignSelf: "center"
  },
  name: {
    textAlignVertical: "center",
    fontFamily: "OpenSansBold",
    fontSize: 14,
    paddingLeft: 8
  },
  description: {
    fontFamily: "OpenSans",
    fontSize: 13
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 24
  },
  container: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(145, 145, 145, 0.1)",
    backgroundColor: "#F4F4F6"
  },
  iconMargin: {
    marginRight: 16
  },
  moreButtonStyle: {
    flex: 1,
    opacity: 0.4,
    alignItems: "flex-end"
  },
  dotIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8
  },
  iconContainer: {
    justifyContent: "center",
    alignContent: "center",
    borderRadius: 12,
    marginRight: 8
  },
  icon: {
    padding: 4
  },
  text14px: {
    fontSize: 14,
    fontFamily: "OpenSans"
  }
})
