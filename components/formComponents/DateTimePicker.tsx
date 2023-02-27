import React, { useEffect } from "react"
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle
} from "react-native"
import RNDateTimePicker, {
  DateTimePickerAndroid as RNDateTimePickerAndroid
} from "@react-native-community/datetimepicker"
import IconButton from "../common/IconButton"
import { dayjs } from "../../lib/dayjs"

/**
 * Default date formatter for `DateTimePicker`.
 * @param date the date to be formatted
 * @returns a string in the form "{Weekday Abreviated}, {Month Abbreviated} {Day of Month}, {Year}"
 */
export const defaultFormatDate = (date: Date) => {
  // TODO: - Should this support multiple locales in the future?
  return dayjs(date).format("MMM D, YYYY")
}

/**
 * Default time formatter for `DateTimePicker`.
 * @param date the date to be formatted
 * @returns a string in the form "{hour}:{minute} {AM or PM}"
 */
export const defaultFormatTime = (date: Date) => {
  return dayjs(date).format("h:mm A")
}

/**
 * Props for `DateTimePicker`.
 */
export type DateTimePickerProps = {
  /**
   * An ID for using this picker in tests.
   */
  testID?: string

  /**
   * The label for the picker.
   */
  label: string

  /**
   * The current date displayed by the picker.
   */
  date: Date

  /**
   * A callback that is invoked whenever the picker date changes.
   */
  onDateChanged: (date: Date) => void

  /**
   * The outer container style of the picker.
   */
  style?: StyleProp<ViewStyle>

  /**
   * A `TextStyle` for the picker label.
   */
  labelStyle?: StyleProp<TextStyle>

  /**
   * (**Android Only**) Formats the pickers date to display
   * month, weekday, and year information.
   */
  formatDate?: (date: Date) => string

  /**
   * (**Android Only**) Formats the pickers date to display
   * hour and minute information.
   */
  formatTime?: (date: Date) => string

  /**
   * The minimum date for this picker.
   *
   * The picker will always ensure that the date is after
   * the minimum.
   */
  minimumDate?: Date

  /**
   * The maximum date for this picker.
   *
   * The picker will always ensure that the date is before
   * the maximum.
   */
  maximumDate?: Date
}

/**
 * A common date time picker component.
 *
 * This component displays differently on iOS and Android respectively.
 * iOS uses it's native date time picker, but on android custom buttons
 * that display a modal are used. The modal then uses Android's native
 * date and time pickers respectively.
 */
const DateTimePicker = (props: DateTimePickerProps) => {
  const { minimumDate, maximumDate, date, onDateChanged } = props

  // TODO: - I don't like this useEffect, but I'm not sure of another way
  // to ensure that the date is always in range...
  useEffect(() => {
    if (minimumDate && date < minimumDate) {
      onDateChanged(minimumDate)
    }

    if (maximumDate && date > maximumDate) {
      onDateChanged(maximumDate)
    }
  }, [minimumDate, maximumDate, date, onDateChanged])

  return Platform.OS === "ios"
    ? (
    <_DateTimePickerIOS {...props} />
      )
    : (
    <_DatePickerAndroid {...props} />
      )
}

const _DateTimePickerIOS = ({
  testID,
  label,
  date,
  onDateChanged,
  style,
  labelStyle: textStyle,
  minimumDate,
  maximumDate
}: DateTimePickerProps) => (
  <View style={[styles.iOSContainer, style]}>
    <Text style={textStyle}>{label}</Text>
    <RNDateTimePicker
      testID={testID}
      mode="datetime"
      value={date}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      style={styles.iOSPickerStyle}
      onChange={(_, date) => {
        if (date) onDateChanged(date)
      }}
    />
  </View>
)

const _DatePickerAndroid = ({
  testID,
  label,
  date,
  onDateChanged,
  style,
  labelStyle: textStyle,
  formatDate = defaultFormatDate,
  formatTime = defaultFormatTime,
  minimumDate,
  maximumDate
}: DateTimePickerProps) => {
  const showDatePicker = (mode: "date" | "time") => {
    RNDateTimePickerAndroid.open({
      testID,
      value: date,
      onChange: (_, date) => {
        if (date) onDateChanged(date)
      },
      mode,
      minimumDate,
      maximumDate
    })
  }

  return (
    <View style={[styles.androidContainer, style]}>
      <Text style={[styles.androidTextMargin, textStyle]}>{label}</Text>
      <View style={styles.androidButtonContainer}>
        <IconButton
          style={styles.androidButtonStyle}
          label={formatDate(date)}
          iconName="calendar-today"
          margin={8}
          onPress={() => showDatePicker("date")}
        />
        <View style={styles.androidButtonGap} />
        <IconButton
          style={styles.androidButtonStyle}
          label={formatTime(date)}
          iconName="access-time"
          margin={8}
          onPress={() => showDatePicker("time")}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  iOSContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iOSPickerStyle: {
    width: 200
  },
  androidContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  androidButtonContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  androidButtonStyle: {
    padding: 8,
    backgroundColor: "#e3e3e4",
    borderRadius: 8
  },
  androidTextMargin: {
    marginBottom: 8
  },
  androidButtonGap: {
    paddingHorizontal: 8
  }
})

export default DateTimePicker
