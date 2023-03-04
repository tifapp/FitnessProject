import {
  EventForm,
  EventFormLocationBanner,
  EventFormLocationInfo
} from "@components/eventForm"
import { Geocoding, geocodingDependencyKey } from "@lib/location"
import { render, screen, waitFor } from "@testing-library/react-native"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import { baseTestEventFormValues } from "./helpers"
import "../../helpers/Matchers"
import { SetDependencyValue } from "@lib/dependencies"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import { baseTestPlacemark } from "../../location/helpers"

const testLocation = baseTestEventFormValues.locationInfo.coordinates
const testLocationName = baseTestPlacemark.name
const testLocationAddress = "1234 Cupertino Rd, Cupertino, CA 95104"

describe("EventFormLocationBanner tests", () => {
  beforeEach(() => (geocoding = unimplementedGeocoding()))

  it("should not attempt to geocode when no location is given", () => {
    renderLocationField()
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should not attempt to geocode when initial placemark info given", () => {
    renderLocationField({
      coordinates: testLocation,
      placemarkInfo: { name: testLocationName, address: testLocationAddress }
    })
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should indicate an error when failing to geocode the given coordinates", async () => {
    geocoding.reverseGeocode.mockRejectedValue(new Error("Geocoding Failed"))
    renderLocationField({ coordinates: testLocation })
    await waitFor(() => expect(errorIndicator()).toBeDisplayed())
  })
})

let geocoding = unimplementedGeocoding()

const renderLocationField = (locationInfo?: EventFormLocationInfo) => {
  render(
    <TestQueryClientProvider>
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
  return screen.queryByText(
    "Unable to find address of location, please try again later."
  )
}
