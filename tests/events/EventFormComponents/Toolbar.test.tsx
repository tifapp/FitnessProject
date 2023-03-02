import {
  EventForm,
  EventFormToolbar,
  EventFormValues
} from "@components/eventForm"
import { dateRange } from "@lib/Date"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { baseTestEventFormValues } from "./helpers"
import "../../helpers/Matchers"
import { EventColors } from "@lib/events/EventColors"

const testDateRange = dateRange(
  new Date("2023-03-01T08:00:00"),
  new Date("2023-03-01T10:00:00")
)

describe("EventFormToolbar tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-01T00:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("should represent the date tab with a formatted date range", () => {
    renderToolbar({
      ...baseTestEventFormValues,
      dateRange: testDateRange
    })
    expect(formattedTestDateRange()).toBeDisplayed()
  })

  test("opening the date section", () => {
    renderToolbar({
      ...baseTestEventFormValues,
      dateRange: testDateRange
    })

    expect(dateSectionTitle()).not.toBeDisplayed()
    openDateSection()
    expect(dateSectionTitle()).toBeDisplayed()
  })

  test("closing the date section", () => {
    renderToolbar({ ...baseTestEventFormValues, dateRange: testDateRange })
    openDateSection()
    closeCurrentSection()
    expect(dateSectionTitle()).not.toBeDisplayed()
    expect(closeButton()).not.toBeDisplayed()
  })

  test("opening the color section", () => {
    renderToolbar({ ...baseTestEventFormValues, color: EventColors.Red })
    expect(colorSectionTitle()).not.toBeDisplayed()
    openColorSection()
    expect(colorSectionTitle()).toBeDisplayed()
  })

  test("closing the color section", () => {
    renderToolbar(baseTestEventFormValues)
    openColorSection()
    closeCurrentSection()
    expect(colorSectionTitle()).not.toBeDisplayed()
    expect(closeButton()).not.toBeDisplayed()
  })

  test("opening the advanced section", () => {
    renderToolbar(baseTestEventFormValues)
    expect(advancedSectionTitle()).not.toBeDisplayed()
    openAdvancedSection()
    expect(advancedSectionTitle()).toBeDisplayed()
  })

  test("closing the advanced section", () => {
    renderToolbar(baseTestEventFormValues)
    openAdvancedSection()
    closeCurrentSection()
    expect(advancedSectionTitle()).not.toBeDisplayed()
    expect(closeButton()).not.toBeDisplayed()
  })
})

const renderToolbar = (values: EventFormValues) => {
  render(
    <EventForm
      initialValues={values}
      onSubmit={jest.fn()}
      onDismiss={jest.fn()}
    >
      <EventFormToolbar />
    </EventForm>
  )
}

const openDateSection = () => {
  fireEvent.press(formattedTestDateRange()!!)
}

const openColorSection = () => {
  fireEvent.press(screen.getByText("Color"))
}

const openAdvancedSection = () => {
  fireEvent.press(screen.getByLabelText("Advanced Settings"))
}

const colorSectionTitle = () => {
  return screen.queryByText("Pick Color")
}

const advancedSectionTitle = () => {
  return screen.queryByText("Advanced")
}

const dateSectionTitle = () => {
  return screen.queryByText("Start and End Dates")
}

const closeCurrentSection = () => {
  fireEvent.press(closeButton()!!)
}

const closeButton = () => {
  return screen.queryByLabelText("Close Section")
}

const formattedTestDateRange = () => {
  return screen.queryByText("Today 8am - 10am")
}
