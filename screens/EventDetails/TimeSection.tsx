import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import * as Calendar from 'expo-calendar';
import { Headline, Caption, CaptionTitle } from "@components/Text"
import { dayjs, now } from "@lib/date"
import { CalendarEvent, addToCalendar, getCalendar } from "@lib/Calendar"
import { ButtonStyles, showToast } from "@lib/ButtonStyle"
import { Ionicon } from "@components/common/Icons"

interface TimeSectionProps {
  color: string
  event: CalendarEvent
}

const TimeSection = ({ color, event }: TimeSectionProps) => {
  const [status, requestPermission] = Calendar.useCalendarPermissions();
  const [addedEvent, setAddedEvent] = useState(false)
  const startDateFormat = event.duration.formattedDate(
    now(),
    dayjs(event.duration.startDate)
  )
  const endDateFormat = event.duration.formattedDate(now(), dayjs(event.duration.endDate))
  const startTimeFormat = dayjs(event.duration.startDate).format("h A")
  const endTimeFormat = dayjs(event.duration.endDate).format("h A")
  const hitSlopInset = {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10
  }

  const addEventToCalendar = async () => {
    let calendar: Calendar.Calendar

    if (status?.granted) {
      calendar = await getCalendar()
      await addToCalendar(calendar.id, event, setAddedEvent)

    } else {
      await requestPermission().then(async (status) => {
        if (status?.granted) {
          calendar = await getCalendar()
          await addToCalendar(calendar.id, event, setAddedEvent)
        }
      }).catch((error) => {
       showToast("Unable to add Event without Permissions", event.bottomTabHeight)
      })
    }
  }

  return (
    <View style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicon 
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="calendar"
          color={"white"}
        />
      </View>
      <View style={styles.spacing}>
        {event.duration.endSameDay()
          ? (
            <View style={{ marginBottom: 4 }}>
              <Headline style={styles.textColor}>{`${startDateFormat}`}</Headline>
              <Caption>{`from ${startTimeFormat} - ${endTimeFormat}`}</Caption>
            </View>
          )
          : (
            <View style={{ marginBottom: 4 }}>
              <Headline>{`From ${startDateFormat}, ${startTimeFormat}`}</Headline>
              <Caption>{`to ${endDateFormat}, ${endTimeFormat}`}</Caption>
            </View>
          )}
        {!addedEvent && (
          <TouchableOpacity onPress={addEventToCalendar} hitSlop={hitSlopInset}>
            <CaptionTitle style={[{ color }, styles.captionLinks]}>
              Add to Calendar
            </CaptionTitle>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default TimeSection

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  paddingIconSection: {
    paddingHorizontal: 16
  },
  iconStyling: {
    padding: 6,
    borderRadius: 12
  },
  spacing: {
    paddingHorizontal: 16
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  textColor: {
    color: ButtonStyles.darkColor
  }
})
