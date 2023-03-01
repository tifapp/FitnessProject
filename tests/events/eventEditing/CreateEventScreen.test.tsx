import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import "../../helpers/Matchers"
import { EventFormLocationInfo } from "@components/eventForm"
import { UpdateDependencyValues } from "@lib/dependencies"
import { geocodingDependencyKey } from "@lib/location"
import { unimplementedEvents } from "../helpers"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import { Events, eventsDependencyKey } from "@lib/events"
import { hapticsDependencyKey } from "@lib/Haptics"
import CreateEventScreen from "@screens/CreateEventScreen"
import { render } from "@testing-library/react-native"

describe("CreateEventScreen tests", () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => jest.runAllTimers())

  it("should have the default date range last 1 hour from the current date", () => {
    jest.setSystemTime(new Date("2023-01-01T10:00:00"))
    const { queryByText } = renderCreateEventScreen()
    expect(queryByText("Today 10am - 11am")).toBeDisplayed()
  })
})

const renderCreateEventScreen = (locationInfo?: EventFormLocationInfo) => {
  return render(
    <TestQueryClientProvider>
      <UpdateDependencyValues
        update={(values) => {
          values.set(geocodingDependencyKey, unimplementedGeocoding())
          values.set(
            eventsDependencyKey,
            unimplementedEvents() as unknown as Events
          )
          values.set(hapticsDependencyKey, jest.fn())
        }}
      >
        <CreateEventScreen locationInfo={locationInfo} />
      </UpdateDependencyValues>
    </TestQueryClientProvider>
  )
}
