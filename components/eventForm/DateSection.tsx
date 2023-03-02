import DateTimePicker from "@components/formComponents/DateTimePicker"
import React from "react"
import { View } from "react-native"
import { useEventFormField } from "."

export const EventFormDateSection = () => {
  const [dateRange, setDateRange] = useEventFormField("dateRange")
  return (
    <View>
      <DateTimePicker
        label="Start Date"
        testID="eventFormStartDate"
        date={dateRange.startDate}
        onDateChanged={(date) => {
          setDateRange((range) => range.moveStartDate(date))
        }}
      />
      <DateTimePicker
        label="End Date"
        testID="eventFormEndDate"
        date={dateRange.endDate}
        onDateChanged={(date) => {
          setDateRange((range) => range.moveEndDate(date))
        }}
      />
    </View>
  )
}
