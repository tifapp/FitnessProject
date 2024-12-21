import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { CaptionTitle, Headline } from "./Text"
import dayjs from "dayjs"

export type CalendarDayProps = {
  date: Date
  style?: StyleProp<ViewStyle>
}

export const CalendarDayView = ({ date, style }: CalendarDayProps) => (
  <View style={style}>
    <View>
      <View style={styles.month}>
        <CaptionTitle style={styles.monthText}>
          {dayjs(date).format("MMM")}
        </CaptionTitle>
      </View>
      <View style={styles.day}>
        <Headline style={styles.dayText}>{dayjs(date).format("D")}</Headline>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  column: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  month: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    color: "white",
    backgroundColor: AppStyles.primaryColor,
    zIndex: 1
  },
  monthText: {
    color: "white"
  },
  day: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: AppStyles.colorOpacity15,
    top: -12
  },
  dayText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16
  }
})
