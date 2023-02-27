import {
  EventForm,
  EventFormToolbar,
  EventFormValues
} from "@components/eventForm"
import { FixedDateRange } from "@lib/Date"
import { render } from "@testing-library/react-native"
import React from "react"
import { baseTestEventValues } from "./helpers"
import "../../helpers/Matchers"

describe("EventFormToolbar tests", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test("eventFormFormatDateRange when start date is today, event takes place within the day", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-26T17:00:00"),
        new Date("2023-02-26T19:00:00")
      ),
      "Today 5pm - 7pm"
    )
  })

  test("eventFormFormatDateRange when start date is tomorrow, event takes place within the day", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-27T17:00:00"),
        new Date("2023-02-27T19:00:00")
      ),
      "Tomorrow 5pm - 7pm"
    )
  })

  test("eventFormFormatDateRange event takes place within the day", () => {
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-25T17:00:00"),
        new Date("2023-02-25T19:00:00")
      ),
      "Feb 25, 5pm - 7pm"
    )
  })

  test("eventFormFormatDateRange event takes place within the day, am times", () => {
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-25T10:00:00"),
        new Date("2023-02-25T11:00:00")
      ),
      "Feb 25, 10am - 11am"
    )
  })

  test("eventFormFormatDateRange event takes place within the day, non-zero minutes", () => {
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-25T17:30:00"),
        new Date("2023-02-25T19:30:00")
      ),
      "Feb 25, 5:30pm - 7:30pm"
    )
  })

  test("eventFormFormatDateRange start date is current date, event takes place within the day, non-zero minutes", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-26T17:30:00"),
        new Date("2023-02-26T19:30:00")
      ),
      "Today 5:30pm - 7:30pm"
    )
  })

  test("eventFormFormatDateRange start date is current date, ends the next day, non-zero minutes", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-26T17:30:00"),
        new Date("2023-02-27T12:30:00")
      ),
      "Today 5:30pm - Tomorrow 12:30pm"
    )
  })

  test("eventFormFormatDateRange start date is current date, ends the next day", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-26T17:00:00"),
        new Date("2023-02-27T12:00:00")
      ),
      "Today 5pm - Tomorrow 12pm"
    )
  })

  test("eventFormFormatDateRange ends the next day, non-zero minutes", () => {
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-24T17:30:00"),
        new Date("2023-02-25T12:30:00")
      ),
      "Feb 24, 5:30pm - Feb 25, 12:30pm"
    )
  })

  test("eventFormFormatDateRange 10 day range, starts today, non-zero minutes, am-pm", () => {
    jest.setSystemTime(new Date("2023-02-24T06:00:00"))
    expectFormattedDateRange(
      new FixedDateRange(
        new Date("2023-02-24T07:30:00"),
        new Date("2023-03-06T16:45:00")
      ),
      "Today 7:30am - Mar 6, 4:45pm"
    )
  })
})

const expectFormattedDateRange = (
  dateRange: FixedDateRange,
  expected: string
) => {
  const { queryByText } = renderEventFormToolbar({
    ...baseTestEventValues,
    dateRange
  })
  expect(queryByText(expected)).toBeDisplayed()
}

const renderEventFormToolbar = (values: EventFormValues) => {
  return render(
    <EventForm initialValues={values} onSubmit={jest.fn()}>
      <EventFormToolbar />
    </EventForm>
  )
}
