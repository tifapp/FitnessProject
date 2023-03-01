import { EventFormLocationInfo } from "@components/eventForm"
import { FixedDateRange } from "@lib/Date"
import { UpdateDependencyValues } from "@lib/dependencies"
import { Events, eventsDependencyKey } from "@lib/events"
import { EventColors } from "@lib/events/EventColors"
import { hapticsDependencyKey } from "@lib/Haptics"
import { geocodingDependencyKey } from "@lib/location"
import CreateEventScreen from "@screens/CreateEventScreen"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import { neverPromise } from "../../helpers/Promise"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import {
  baseTestEventValues,
  editEventDescription,
  editEventTitle,
  moveEventEndDate,
  moveEventStartDate,
  pickEventColor,
  toggleShouldHideAfterStartDate
} from "./helpers"
import { unimplementedEvents } from "../helpers"

describe("CreateEventScreen tests", () => {
  beforeEach(() => (events = unimplementedEvents()))

  it("should be able to create an event with a preselected location", async () => {
    events.createEvent.mockImplementation(neverPromise)
    renderCreateEventScreen(baseTestEventValues.locationInfo)

    const title = "Test Event"
    const description = "Hello world this is a test."
    const startDate = new Date("2023-04-01T10:00:00")
    const endDate = new Date("2023-04-01T11:00:00")

    editEventTitle(title)
    editEventDescription(description)
    moveEventStartDate(startDate)
    moveEventEndDate(endDate)
    pickEventColor("Turquoise")
    toggleShouldHideAfterStartDate()
    createEvent()

    await waitFor(() => {
      expect(events.createEvent).toHaveBeenCalledWith({
        title,
        description,
        location: baseTestEventValues.locationInfo.coordinates,
        dateRange: new FixedDateRange(startDate, endDate),
        color: EventColors.Turquoise,
        radiusMeters: 0,
        shouldHideAfterStartDate: true
      })
    })
  })
})

let events = unimplementedEvents()

const createEvent = () => {
  fireEvent.press(screen.getByText("Create Event"))
}

const renderCreateEventScreen = (locationInfo?: EventFormLocationInfo) => {
  return render(
    <TestQueryClientProvider>
      <UpdateDependencyValues
        update={(values) => {
          values.set(geocodingDependencyKey, unimplementedGeocoding())
          values.set(eventsDependencyKey, events as unknown as Events)
          values.set(hapticsDependencyKey, jest.fn())
        }}
      >
        <CreateEventScreen locationInfo={locationInfo} />
      </UpdateDependencyValues>
    </TestQueryClientProvider>
  )
}
