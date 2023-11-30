import { DateTimePicker } from "@date-time"
import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { useEventFormField } from "./EventForm"

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
      <View style={styles.spacer} />
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
  <View style={styles.pickerContainer}>
    <Text maxFontSizeMultiplier={1.5} style={styles.label}>
      {label}
    </Text>
    <DateTimePicker
      testID={testID}
      date={date}
      style={styles.picker}
      onDateChanged={onDateChanged}
    />
  </View>
)

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "bold"
  },
  picker: {
    width: 256,
    height: 44
  },
  spacer: {
    marginBottom: 12
  },
  pickerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%"
  }
})
