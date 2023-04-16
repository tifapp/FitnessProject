import {
  Location,
  LocationCoordinate2D,
  GeocodingDependencyKeys,
  mockLocation,
  mockLocationCoordinate2D
} from "@lib/location"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import {
  LocationSearchUserCoordinatesOption,
  HeaderLocationSearchBar
} from "@screens/LocationSearch"
import { SetDependencyValue } from "@lib/dependencies"
import "../../helpers/Matchers"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"

describe("LocationSearchUI tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("SearchBar tests", () => {
    it("allows for backwards navigation", () => {
      renderSearchBar()
      navigateBack()
      expect(backwardsNavigationAction).toHaveBeenCalled()
    })

    const backwardsNavigationAction = jest.fn()

    const renderSearchBar = () => {
      return render(
        <HeaderLocationSearchBar onBackTapped={backwardsNavigationAction} />
      )
    }

    const navigateBack = () => {
      fireEvent.press(screen.getByLabelText("Go back"))
    }
  })

  describe("CurrentUserCoordinatesOption tests", () => {
    it("reverse geocodes the user's location when selected", async () => {
      const reverseGeocodedLocation = mockLocation()
      reverseGeocode.mockResolvedValue(reverseGeocodedLocation)

      const coordinates = mockLocationCoordinate2D()
      renderOption(coordinates)
      performSelection()
      await waitFor(() => {
        expect(reverseGeocode).toHaveBeenCalledWith(coordinates)
        expect(selectedLocation).toMatchObject(reverseGeocodedLocation)
      })
    })

    it("gives back initial coordinates when failing to reverse geocode selection", async () => {
      reverseGeocode.mockRejectedValue(new Error())

      const coordinates = mockLocationCoordinate2D()
      renderOption(coordinates)
      performSelection()
      await waitFor(() => {
        expect(selectedLocation).toMatchObject({
          coordinates,
          placemark: {}
        })
      })
    })

    const performSelection = () => {
      fireEvent.press(screen.getByText("Use current location"))
    }

    const reverseGeocode = jest.fn()
    let selectedLocation: Location

    const renderOption = (coordinates: LocationCoordinate2D) => {
      return render(
        <TestQueryClientProvider>
          <SetDependencyValue
            forKey={GeocodingDependencyKeys.reverseGeocode}
            value={reverseGeocode}
          >
            <LocationSearchUserCoordinatesOption
              onSelected={(selection) => (selectedLocation = selection)}
              coordinates={coordinates}
            />
          </SetDependencyValue>
        </TestQueryClientProvider>
      )
    }
  })
})
