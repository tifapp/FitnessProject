import {
  EventForm,
  EventFormLocationBanner,
  EventFormLocationInfo
} from "@components/eventForm"
import { GeocodingFunctionsProvider } from "@location/Geocoding"
import { baseTestPlacemark } from "@location/MockData"
import "@test-helpers/Matchers"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, render, screen, waitFor } from "@testing-library/react-native"
import { baseTestEventFormValues } from "./helpers"

const testLocation = baseTestEventFormValues.locationInfo.coordinates
const testLocationName = baseTestPlacemark.name
const testLocationAddress = "1234 Cupertino Rd, Cupertino, CA 95104"

describe("EventFormLocationBanner tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should not attempt to geocode when no location is given", () => {
    renderLocationField()
    expect(reverseGeocode).not.toHaveBeenCalled()
  })

  it("should not attempt to geocode when initial placemark info given", () => {
    renderLocationField({
      coordinates: testLocation,
      placemarkInfo: { name: testLocationName, address: testLocationAddress }
    })
    expect(reverseGeocode).not.toHaveBeenCalled()
  })

  it("should indicate an error when failing to geocode the given coordinates", async () => {
    reverseGeocode.mockRejectedValue(new Error("Geocoding Failed"))
    renderLocationField({
      coordinates: { latitude: 45.123456, longitude: 45.123456 }
    })
    await waitFor(() => expect(errorIndicator()).toBeDisplayed())
  })
})

const reverseGeocode = jest.fn()

const renderLocationField = (locationInfo?: EventFormLocationInfo) => {
  render(
    <TestQueryClientProvider>
      <GeocodingFunctionsProvider reverseGeocode={reverseGeocode}>
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
      </GeocodingFunctionsProvider>
    </TestQueryClientProvider>
  )
}

const errorIndicator = () => {
  return screen.queryByText("Unable to find location, please try again later.")
}
