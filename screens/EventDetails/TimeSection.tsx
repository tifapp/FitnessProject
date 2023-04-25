import React from "react"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Headline, Caption } from "@components/Text"
import { FixedDateRange, dayjs, now } from "@lib/date"

interface TimeSectionProps {
  color: string
  duration: FixedDateRange
}

const TimeSection = ({ color, duration }: TimeSectionProps) => {
  const startDateFormat = duration.formattedDate(
    now(),
    dayjs(duration.startDate)
  )
  const endDateFormat = duration.formattedDate(now(), dayjs(duration.endDate))
  const startTimeFormat = dayjs(duration.startDate).format("h A")
  const endTimeFormat = dayjs(duration.endDate).format("h A")

  return (
    <View style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicons
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="calendar"
          color={"white"}
          size={24}
        />
      </View>
      <View style={styles.spacing}>
        {duration.endSameDay()
          ? (
            <View style={{ marginBottom: 4 }}>
              <Headline>{`${startDateFormat}`}</Headline>
              <Caption>{`from ${startTimeFormat} - ${endTimeFormat}`}</Caption>
            </View>
          )
          : (
            <View style={{ marginBottom: 4 }}>
              <Headline>{`From ${startDateFormat}, ${startTimeFormat}`}</Headline>
              <Caption>{`to ${endDateFormat}, ${endTimeFormat}`}</Caption>
            </View>
          )}
        <Caption style={[{ color }, styles.captionLinks]}>
          Add to Calendar
        </Caption>
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
  }
})
