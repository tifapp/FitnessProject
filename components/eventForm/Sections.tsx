import DateTimePicker from "@components/formComponents/DateTimePicker"
import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { EventColors } from "@lib/events/EventColors"
import { View, Text, StyleSheet } from "react-native"
import { useEventFormField } from "./EventFormProvider"
import React from "react"

/**
 * A color picker for an event form.
 */
export const EventFormColorPicker = () => {
  const [color, setColor] = useEventFormField("color")
  return (
    <HexColorPicker
      color={color}
      options={eventColorPickerOptions}
      onChange={(value) => setColor(value)}
    />
  )
}

export const eventColorPickerOptions = Object.entries(EventColors).map(
  ([name, color]) => ({
    accessibilityLabel: name,
    color
  })
) as HexColorPickerOption<EventColors>[]

/**
 * A date picker for an event form.
 */
export const EventFormDatePicker = () => {
  // TODO: - This needs a better UI
  const [dateRange, setDateRange] = useEventFormField("dateRange")
  return (
    <View>
      <LabeledDatePicker
        testID="eventFormStartDate"
        label="Start Date"
        date={dateRange.startDate}
        onDateChanged={(date) => {
          setDateRange((range) => range.moveStartDate(date))
        }}
      />
      <View style={styles.datePickerSpacer} />
      <LabeledDatePicker
        testID="eventFormEndDate"
        label="End Date"
        date={dateRange.endDate}
        onDateChanged={(date) => {
          setDateRange((range) => range.moveEndDate(date))
        }}
      />
    </View>
  )
}

type LabeledDatePickerProps = {
  testID: string
  label: string
  date: Date
  onDateChanged: (date: Date) => void
}

const LabeledDatePicker = ({
  testID,
  label,
  date,
  onDateChanged
}: LabeledDatePickerProps) => (
  <View style={styles.datePickerContainer}>
    <Text maxFontSizeMultiplier={1.5} style={styles.datePickerLabel}>
      {label}
    </Text>
    <DateTimePicker
      testID={testID}
      date={date}
      style={styles.datePicker}
      onDateChanged={onDateChanged}
    />
  </View>
)

const styles = StyleSheet.create({
  datePickerLabel: {
    fontSize: 16,
    fontWeight: "bold"
  },
  datePicker: {
    width: 256,
    height: 44
  },
  datePickerSpacer: {
    marginBottom: 12
  },
  datePickerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%"
  }
})
