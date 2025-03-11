import { AppStyles } from "@lib/AppColorStyle"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { BalloonIcon } from "./Balloon"
import { CaptionTitle, Subtitle } from "./Text"

export type CalendarDayProps = {
  date: Date;
  style?: StyleProp<ViewStyle>;
  maxDaysAhead?: number; // Maximum days ahead to show balloon (default 30)
};

export const CalendarDayView = ({
  date,
  style,
  maxDaysAhead = 7
}: CalendarDayProps) => {
  const day = dayjs(date).format("D")
  const month = dayjs(date).format("MMM").toUpperCase()

  // Calculate days away from today (positive for future, negative for past)
  const daysAway = useMemo(() => {
    const today = dayjs()
    return dayjs(date).diff(today, "day")
  }, [date])

  // Calculate if the date is today
  const isToday = daysAway === 0

  return (
    <View style={[styles.container, style,
      (daysAway < 0) && { opacity: 0.5 }, // Past dates are faded
      (!isToday && daysAway > 0) && { opacity: 0.75 } // Future dates slightly faded
    ]}>
      {/* Month header styled like a flight gate/destination display */}
      <View style={styles.monthContainer}>
        <CaptionTitle style={styles.monthText}>{month}</CaptionTitle>
      </View>

      {/* Day styled as a ticket or boarding pass */}
      <View style={[
        styles.dayContainer,
        isToday && styles.todayContainer,
        (daysAway > 0 && daysAway <= maxDaysAhead) && styles.upcomingContainer
      ]}>
        {/* Balloon SVG - only shown for upcoming dates within range */}
        {isToday && (
          <View style={styles.balloon}>
            <BalloonIcon
              width={128}
              height={128}
              color={AppStyles.colorOpacity10}
            />
          </View>
        )}

        {/* Day number displays on top of the balloon */}
        <Subtitle style={styles.dayText}>{day}</Subtitle>
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
    overflow: "hidden", // Prevents content from bleeding outside
    minHeight: 40 // Ensures consistent height
  },
  todayContainer: {
    borderColor: AppStyles.primaryColor,
    backgroundColor: "#f8fbff" // Very light blue background for today
  },
  upcomingContainer: {
    borderColor: AppStyles.colorOpacity10
  },
  dayText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    zIndex: 2 // Ensures day text appears above the balloon
  }
})
