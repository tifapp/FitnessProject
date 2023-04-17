import {
  Location,
  LocationCoordinate2D,
  mockLocation,
  mockLocationCoordinate2D,
  mockTrackedLocationCoordinate
} from "@lib/location"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import {
  LocationSearchUserLocationOptionView,
  LocationSearchBar,
  LocationSearchOptionView,
  LocationSearchDependencyKeys,
  LocationSearchOptionsListView,
  mockLocationSearchOption,
  LocationSearchPicker
} from "@screens/LocationSearch"
import { SetDependencyValue } from "@lib/dependencies"
import "../../helpers/Matchers"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
import { neverPromise } from "../../helpers/Promise"
import { View } from "react-native"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { GeocodingDependencyKeys } from "@hooks/Geocoding"

describe("LocationSearch tests", () => {
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
          <LocationSearchBar
            placeholder="Test"
            onBackTapped={backwardsNavigationAction}
          />
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
              <LocationSearchUserLocationOptionView
                onSelected={(selection) => (selectedLocation = selection)}
                coordinates={coordinates}
              />
            </SetDependencyValue>
          </TestQueryClientProvider>
        )
      }
    })

    describe("LocationOption tests", () => {
      it("should save the selected option", async () => {
        const location = mockLocation()
        renderOption(location)
        selectLocation(location.placemark.name)
        expect(selectedLocation).toMatchObject(location)
        expect(saveSelection).toHaveBeenCalledWith(location)
      })

      const selectLocation = (name: string) => {
        fireEvent.press(screen.getByText(name))
      }

      const saveSelection = jest.fn()

      let selectedLocation: Location
      const renderOption = (location: Location) => {
        return render(
          <SetDependencyValue
            forKey={LocationSearchDependencyKeys.saveSelection}
            value={saveSelection}
          >
            <LocationSearchOptionView
              onSelected={(selection) => (selectedLocation = selection)}
              distanceMiles={0}
              option={{
                location,
                isRecentLocation: false
              }}
            />
          </SetDependencyValue>
        )
      }
    })

    describe("OptionsList tests", () => {
      beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
      })
      afterEach(() => jest.useRealTimers())

      it("should indicate an error when loading options fails", async () => {
        loadLocationOptions.mockRejectedValue(new Error())
        renderOptionsList()
        await waitFor(() => expect(errorIndicator()).toBeDisplayed())
      })

      it("should indicate that there are no recents when no options available with empty search", async () => {
        loadLocationOptions.mockResolvedValue([])
        renderOptionsList()
        await waitFor(() => expect(noRecentsIndicator()).toBeDisplayed())
      })

      it("should debounce when search text changes", async () => {
        const center = mockLocationCoordinate2D()
        loadLocationOptions.mockImplementation(neverPromise)
        renderOptionsList(center)

        let searchText = "Hello World!"
        enterSearchText(searchText)
        await waitFor(() => {
          expect(loadLocationOptions).toHaveBeenCalledWith("", center)
        })

        jest.advanceTimersByTime(50)
        await waitFor(() => {
          expect(loadLocationOptions).not.toHaveBeenCalledWith(
            searchText,
            center
          )
        })

        searchText = "The user changed the text while typing or something..."
        enterSearchText(searchText)

        jest.advanceTimersByTime(50)
        await waitFor(() => {
          expect(loadLocationOptions).not.toHaveBeenCalledWith(
            searchText,
            center
          )
        })

        jest.advanceTimersByTime(50)
        await waitFor(() => {
          expect(loadLocationOptions).toHaveBeenCalledWith(searchText, center)
        })
      })

      it("should indicate that no results were found when no options available with non-empty search", async () => {
        loadLocationOptions.mockResolvedValue([])
        renderOptionsList()

        const searchText = "Chuck E. Cheese"
        enterSearchText(searchText)
        await waitFor(() => {
          expect(noResultsIndicator(searchText)).toBeDisplayed()
        })
      })

      it("displays a loading indicator when searched results have not yet loaded", async () => {
        loadLocationOptions.mockImplementation(neverPromise)
        renderOptionsList()
        await waitFor(() => expect(loadingIndicator()).toBeDisplayed())
      })

      it("should display the center's distance from each result in miles if able", async () => {
        const center = { latitude: 41.1234, longitude: -121.1234 }
        const mockOption = mockLocationSearchOption()
        loadLocationOptions.mockResolvedValue([
          {
            ...mockOption,
            location: {
              ...mockOption.location,
              coordinates: { latitude: 36.5678, longitude: 0.1234 }
            }
          }
        ])
        renderOptionsList(center)
        await waitFor(() => {
          expect(
            distanceForLocationName(
              mockOption.location.placemark.name!,
              5909.319265423842
            )
          ).toBeDisplayed()
        })
      })

      const errorIndicator = () => {
        return screen.queryByText(
          "Something went wrong, please check your internet connection and try again later."
        )
      }

      const noRecentsIndicator = () => {
        return screen.queryByText(
          "No recent locations. Locations of events that you host and attend will appear here."
        )
      }

      const noResultsIndicator = (text: string) => {
        return screen.queryByText(`Sorry, no results found for "${text}".`)
      }

      const loadingIndicator = () => {
        return screen.queryByTestId("loading-location-options")
      }

      const distanceForLocationName = (name: string, distanceMiles: number) => {
        return screen.queryByTestId(locationOptionTestId(name, distanceMiles))
      }

      const locationOptionTestId = (name: string, distanceMiles?: number) => {
        return `${name}-${distanceMiles}`
      }

      const loadLocationOptions = jest.fn()

      const placeholder = "Test Search"

      const enterSearchText = (text: string) => {
        fireEvent.changeText(screen.getByPlaceholderText(placeholder), text)
      }

      const renderOptionsList = (center?: LocationCoordinate2D) => {
        return render(
          <TestQueryClientProvider>
            <SetDependencyValue
              forKey={LocationSearchDependencyKeys.loadOptions}
              value={loadLocationOptions}
            >
              <LocationSearchBar
                onBackTapped={jest.fn()}
                placeholder={placeholder}
              />
              <LocationSearchOptionsListView
                center={center}
                onLocationSelected={jest.fn()}
                renderOption={({ option, distanceMiles }) => (
                  <View
                    testID={locationOptionTestId(
                      option.location.placemark.name!,
                      distanceMiles
                    )}
                  />
                )}
              />
            </SetDependencyValue>
          </TestQueryClientProvider>
        )
      }
    })

    describe("Picker tests", () => {
      it("displays the option to use the user's location when able", async () => {
        const userCoordinates = mockTrackedLocationCoordinate()
        queryCurrentCoordinates.mockResolvedValue(userCoordinates)
        renderPicker()
        await waitFor(() => expect(userLocationOption()).toBeDisplayed())
      })

      const queryCurrentCoordinates = jest.fn()

      const userLocationOptionTestId = "user-location-option"

      const userLocationOption = () => {
        return screen.queryByTestId(userLocationOptionTestId)
      }

      const renderPicker = () => {
        return render(
          <TestQueryClientProvider>
            <SetDependencyValue
              forKey={UserLocationDependencyKeys.currentCoordinates}
              value={queryCurrentCoordinates}
            >
              <LocationSearchPicker
                onLocationSelected={jest.fn()}
                renderOptionsList={() => <></>}
                renderUserLocationOption={() => (
                  <View testID={userLocationOptionTestId} />
                )}
              />
            </SetDependencyValue>
          </TestQueryClientProvider>
        )
      }
    })
  })
})
