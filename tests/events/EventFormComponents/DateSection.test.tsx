import {
  EventForm,
  EventFormDateSection,
  useEventFormContext
} from "@components/eventForm"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import { setDateTimePickerDate } from "../../helpers/DateTimePicker"
import { baseTestEventFormValues } from "./helpers"
import "../../helpers/Matchers"

describe("EventFormDateSection tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-01T08:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("should be able to select a start date", () => {
    const selectedDate = new Date("2023-01-01T00:00:00")
    renderDateSection()
    moveStartDate(selectedDate)
    expect(selectedStartDate(selectedDate)).toBeDisplayed()
  })

  it("should be able to select an end date", () => {
    const selectedDate = new Date("2023-01-01T00:00:00")
    renderDateSection()
    moveEndDate(selectedDate)
    expect(selectedEndDate(selectedDate)).toBeDisplayed()
  })
})

const renderDateSection = () => {
  render(
    <EventForm initialValues={baseTestEventFormValues} onSubmit={jest.fn()}>
      <SelectedDates />
      <EventFormDateSection />
    </EventForm>
  )
}

const SelectedDates = () => {
  const dateRange = useEventFormContext().watch("dateRange")
  return (
    <View>
      <View testID={startDateId(dateRange.startDate)} />
      <View testID={endDateId(dateRange.endDate)} />
    </View>
  )
}

const startDateId = (date: Date) => `start-${date}`
const endDateId = (date: Date) => `end-${date}`

const selectedStartDate = (date: Date) => {
  return screen.queryByTestId(startDateId(date))
}

const selectedEndDate = (date: Date) => {
  return screen.queryByTestId(endDateId(date))
}

const moveStartDate = (date: Date) => {
  setDateTimePickerDate({ toDate: date, testID: "eventFormStartDate" })
}

const moveEndDate = (date: Date) => {
  setDateTimePickerDate({ toDate: date, testID: "eventFormEndDate" })
}
