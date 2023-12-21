import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { Headline, Caption } from "@components/Text"
import { dayjs, now } from "@date-time"
import { Ionicon } from "@components/common/Icons"
import { Divider } from "react-native-elements"
import { CurrentUserEvent } from "./Event"

interface TimeSectionProps {
  color: string
  event: CurrentUserEvent
}

const TimeSection = ({ color, event }: TimeSectionProps) => {
  const [dividerWidth, setDividerWidth] = useState(0)
  const startDateFormat = event.dateRange.formattedDate(
    now(),
    dayjs(event.dateRange.startDate)
  )
  const endDateFormat = event.dateRange.formattedDate(
    now(),
    dayjs(event.dateRange.endDate)
  )
  const startTimeFormat = dayjs(event.dateRange.startDate).format("h A")
  const endTimeFormat = dayjs(event.dateRange.endDate).format("h A")

  const onLayout = (e: { nativeEvent: { layout: { width: any } } }) => {
    setDividerWidth(e.nativeEvent.layout.width)
  }

  return (
    <View>
      <View style={[styles.flexRow, styles.paddingIconSection]}>
        <View style={[styles.iconStyling, { backgroundColor: color }]}>
          <Ionicon name="calendar" color={"white"} />
        </View>
        <View style={styles.spacing} onLayout={onLayout}>
          {event.dateRange.endSameDay()
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
        </View>
      </View>
      <Divider style={[styles.divider, { width: dividerWidth + 16 }]} />
    </View>
  )
}

export default TimeSection

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  paddingIconSection: {
    marginHorizontal: 16,
    alignItems: "center"
  },
  iconStyling: {
    padding: 6,
    marginRight: 16,
    borderRadius: 12,
    justifyContent: "center"
  },
  spacing: {
    flex: 1
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  divider: {
    marginVertical: 16,
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  }
})
