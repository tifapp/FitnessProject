import { AppStyles } from "@lib/AppColorStyle"
import dayjs from "dayjs"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { now } from "TiFShared/lib/Dayjs"
import { BalloonIcon } from "./Balloon"
import { CaptionTitle, Subtitle } from "./Text"

export type CalendarDayProps = {
  date: Date
  style?: StyleProp<ViewStyle>
  maxDaysAhead?: number
}

export const calendarCountdown = (date: Date, maxDaysAhead: number = 7) => {
  const daysDiff = date.ext.diff(new Date()).days
  const isToday = now().isSame(date, "day")
  return {
    isToday,
    isStartingSoon: daysDiff <= maxDaysAhead && daysDiff > 0,
    isPast: daysDiff < 0,
    isFuture: !isToday && daysDiff > 0
  }
}

export const CalendarDayView = ({
  date,
  style,
  maxDaysAhead = 7
}: CalendarDayProps) => {
  const { isToday, isPast, isStartingSoon, isFuture } = calendarCountdown(
    date,
    maxDaysAhead
  )
  return (
    <View
      style={[
        styles.container,
        style,
        isPast && !isToday && styles.pastOpacity,
        isFuture && styles.futureOpacity
      ]}
    >
      <View style={styles.monthContainer}>
        <CaptionTitle style={styles.monthText}>
          {dayjs(date).format("MMM").toUpperCase()}
        </CaptionTitle>
      </View>
      <View
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          isStartingSoon && styles.upcomingContainer
        ]}
      >
        {isToday && (
          <View style={styles.balloon}>
            <BalloonIcon
              width={128}
              height={128}
              color={AppStyles.colorOpacity10}
            />
          </View>
        )}
        <Subtitle style={styles.dayText}>{dayjs(date).format("D")}</Subtitle>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  balloon: {
    width: 128,
    height: 128,
    position: "absolute",
    right: "-100%",
    bottom: 0
  },
  pastOpacity: {
    opacity: 0.5
  },
  futureOpacity: {
    opacity: 0.75
  },
  container: {
    width: 64,
    overflow: "visible"
  },
  monthContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: AppStyles.primaryColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: "center"
  },
  monthText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 1
  },
  dayContainer: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingBottom: 12,
    alignItems: "center",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: AppStyles.colorOpacity15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: "relative",
    overflow: "hidden",
    minHeight: 40
  },
  todayContainer: {
    borderColor: AppStyles.primaryColor,
    backgroundColor: "#f8fbff"
  },
  upcomingContainer: {
    borderColor: AppStyles.colorOpacity10
  },
  dayText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    zIndex: 2
  }
})
