import {
  EventForm,
  EventFormLocationField,
  EventFormLocationInfo
} from "@components/eventForm"
import { Geocoding, geocodingDependencyKey } from "@lib/location"
import { render, screen, waitFor } from "@testing-library/react-native"
import {
  mockReverseGeocodedPlacemarks,
  unimplementedGeocoding
} from "../../helpers/Geocoding"
import { baseTestEventValues } from "./helpers"
import "../../helpers/Matchers"
import { SetDependencyValue } from "@lib/dependencies"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import {
  baseTestPlacemark,
  unknownLocationPlacemark
} from "../../location/helpers"

const testLocation = baseTestEventValues.locationInfo.coordinates
const testLocationName = baseTestPlacemark.name
const testLocationAddress = "1234 Cupertino Rd, Cupertino, CA 95104"

describe("EventFormLocationField tests", () => {
  beforeEach(() => (geocoding = unimplementedGeocoding()))

  it("should not attempt to geocode anything when no location is given", () => {
    renderLocationField()
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should use the predetermined placemark name and address if provided", () => {
    renderLocationField({
      coordinates: testLocation,
      placemarkInfo: { name: testLocationName, address: testLocationAddress }
    })
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
    expect(testPlacemarkName()).toBeDisplayed()
    expect(testPlacemarkAddress()).toBeDisplayed()
  })

  it("should indicate an error when geocoding fails", async () => {
    geocoding.reverseGeocode.mockRejectedValue(new Error("Geocoding Failed"))
    renderLocationField({ coordinates: testLocation })
    await waitFor(() => expect(errorIndicator()).toBeDisplayed())
  })

  it("should display the location's placemark's name and address after geocoding the location", async () => {
    mockReverseGeocodedPlacemarks(testLocation, [baseTestPlacemark], geocoding)
    renderLocationField({ coordinates: testLocation })
    await waitFor(() => {
      expect(testPlacemarkName()).toBeDisplayed()
      expect(testPlacemarkAddress()).toBeDisplayed()
    })
  })

  it("should indicate that the placemark's address is unknown when it cannot be determined", async () => {
    mockReverseGeocodedPlacemarks(
      testLocation,
      [unknownLocationPlacemark],
      geocoding
    )
    renderLocationField({ coordinates: testLocation })
    await waitFor(() => expect(unknownAddressIndicator()).toBeDisplayed())
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
            ...baseTestEventValues,
            locationInfo
          }}
          onSubmit={jest.fn()}
        >
          <EventFormLocationField />
        </EventForm>
      </SetDependencyValue>
    </TestQueryClientProvider>
  )
}

const unknownAddressIndicator = () => screen.queryByText("Unknown Address")

const errorIndicator = () => {
  return screen.queryByText(
    "Unable to find address of location, please try again later."
  )
}

const testPlacemarkName = () => {
  return screen.queryByText(testLocationName)
}

const testPlacemarkAddress = () => {
  return screen.queryByText(testLocationAddress)
}
