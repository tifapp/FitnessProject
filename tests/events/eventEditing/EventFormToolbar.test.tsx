import {
  EventForm,
  EventFormToolbar,
  EventFormValues
} from "@components/eventForm"
import { dateRange, FixedDateRange } from "@lib/Date"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { baseTestEventValues } from "./helpers"
import "../../helpers/Matchers"

describe("EventFormToolbar tests", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it("should represent the date tab with a formatted date range", () => {
    jest.setSystemTime(new Date("2023-03-01"))
    const range = dateRange(
      new Date("2023-03-01T08:00:00"),
      new Date("2023-03-01T10:00:00")
    )
    renderToolbar({
      ...baseTestEventValues,
      dateRange: range
    })
    expect(dateTabLabel(range)).toBeDisplayed()
  })

  test("opening the date section", () => {
    jest.setSystemTime(new Date("2023-03-01"))
    const range = dateRange(
      new Date("2023-03-01T08:00:00"),
      new Date("2023-03-01T10:00:00")
    )
    renderToolbar({
      ...baseTestEventValues,
      dateRange: range
    })

    expect(dateSectionTitle()).not.toBeDisplayed()
    openDateSection(range)
    expect(dateSectionTitle()).toBeDisplayed()
  })
})

const renderToolbar = (values: EventFormValues) => {
  render(
    <EventForm initialValues={values} onSubmit={jest.fn()}>
      <EventFormToolbar />
    </EventForm>
  )
}

const openDateSection = (range: FixedDateRange) => {
  fireEvent.press(dateTabLabel(range)!!)
}

const dateSectionTitle = () => {
  return screen.queryByText("Start and End Dates")
}

const dateTabLabel = (range: FixedDateRange) => {
  return screen.queryByText(range.formatted())
}
