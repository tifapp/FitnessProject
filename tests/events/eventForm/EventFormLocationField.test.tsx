import {
  EventForm,
  EventFormLocationField,
  EventFormValues
} from "@components/eventForm"
import {
  formatLocation,
  Geocoding,
  geocodingDependencyKey,
  Location,
  Placemark
} from "@lib/location"
import { render, screen, waitFor } from "@testing-library/react-native"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import { neverPromise } from "../../helpers/Promise"
import { baseTestEventValues } from "./helpers"
import "../../helpers/Matchers"
import { SetDependencyValue } from "@lib/dependencies"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import { baseTestPlacemark } from "../../location/helpers"

describe("EventFormLocationField tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should not attempt to geocode anything when no location is given", () => {
    renderLocationField({ ...baseTestEventValues, location: undefined })
    expect(geocoding.reverseGeocode).not.toHaveBeenCalled()
  })

  it("should display the longitude and latitude while geocoding the location", () => {
    geocoding.reverseGeocode.mockImplementation(neverPromise)
    renderLocationField(baseTestEventValues)
    expect(coordinates(baseTestEventValues.location)).toBeDisplayed()
  })

  it("should display an error result when geocoding fails", async () => {
    geocoding.reverseGeocode.mockRejectedValue(new Error("Geocoding Failed"))
    renderLocationField(baseTestEventValues)
    await waitFor(() => {
      expect(errorText()).toBeDisplayed()
      expect(coordinates(baseTestEventValues.location)).toBeDisplayed()
    })
  })

  it("should display the placemark name after geocoding when name placemark has a name", async () => {
    geocoding.reverseGeocode.mockResolvedValue([baseTestPlacemark])
    renderLocationField(baseTestEventValues)
    await waitFor(() => {
      expect(placemarkName(baseTestPlacemark)).toBeDisplayed()
    })
  })

  it("should display an error result when geocoded placemark has no name", async () => {
    geocoding.reverseGeocode.mockResolvedValue([
      { ...baseTestPlacemark, name: null }
    ])
    renderLocationField(baseTestEventValues)
    await waitFor(() => {
      expect(errorText()).toBeDisplayed()
      expect(coordinates(baseTestEventValues.location)).toBeDisplayed()
    })
  })
})

const geocoding = unimplementedGeocoding

const renderLocationField = (values: EventFormValues) => {
  render(
    <TestQueryClientProvider>
      <SetDependencyValue
        forKey={geocodingDependencyKey}
        value={geocoding as Geocoding}
      >
        <EventForm initialValues={values} onSubmit={jest.fn()}>
          <EventFormLocationField />
        </EventForm>
      </SetDependencyValue>
    </TestQueryClientProvider>
  )
}

const errorText = () => {
  return screen.queryByText(
    "Unable to find address of location, please try again later."
  )
}

const placemarkName = (placemark: Placemark) => {
  return screen.queryByText(placemark.name!!)
}

const coordinates = (location: Location) => {
  return screen.queryByText(formatLocation(location))
}
