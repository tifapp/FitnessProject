import {
  EventForm,
  EventFormLocationBanner,
  EventFormLocationInfo
} from "@components/eventForm"
import { SetDependencyValue } from "@lib/dependencies"
import { Geocoding, geocodingDependencyKey } from "@lib/location"
import { render, screen, waitFor } from "@testing-library/react-native"
import { QueryClient } from "react-query"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import "../../helpers/Matchers"
import {
  createTestQueryClient,
  TestQueryClientProvider
} from "../../helpers/ReactQuery"
import { baseTestPlacemark } from "../../location/helpers"
import { baseTestEventFormValues } from "./helpers"

const testLocation = baseTestEventFormValues.locationInfo.coordinates
const testLocationName = baseTestPlacemark.name
const testLocationAddress = "1234 Cupertino Rd, Cupertino, CA 95104"

const queryClient = createTestQueryClient()

describe("EventFormLocationBanner tests", () => {
  beforeEach(() => (geocoding = unimplementedGeocoding()))

  it("should not attempt to geocode when no location is given", () => {
    renderLocationField(queryClient)
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should not attempt to geocode when initial placemark info given", () => {
    renderLocationField(queryClient, {
      coordinates: testLocation,
      placemarkInfo: { name: testLocationName, address: testLocationAddress }
    })
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should indicate an error when failing to geocode the given coordinates", async () => {
    geocoding.reverseGeocode.mockRejectedValue(new Error("Geocoding Failed"))
    renderLocationField(queryClient, {
      coordinates: { latitude: 45.123456, longitude: 45.123456 }
    })
    await waitFor(() => expect(errorIndicator()).toBeDisplayed())
  })

  afterAll(() => {
    queryClient.removeQueries()
    queryClient.clear()
  })
})

let geocoding = unimplementedGeocoding()

const renderLocationField = (
  queryClient: QueryClient,
  locationInfo?: EventFormLocationInfo
) => {
  render(
    <TestQueryClientProvider client={queryClient}>
      <SetDependencyValue
        forKey={geocodingDependencyKey}
        value={geocoding as Geocoding}
      >
        <EventForm
          initialValues={{
            ...baseTestEventFormValues,
            locationInfo
          }}
          onSubmit={jest.fn()}
          onDismiss={jest.fn()}
        >
          <EventFormLocationBanner />
        </EventForm>
      </SetDependencyValue>
    </TestQueryClientProvider>
  )
}

const errorIndicator = () => {
  return screen.queryByText("Unable to find location, please try again later.")
}
