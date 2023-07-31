import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { SetDependencyValue, UpdateDependencyValues } from "@lib/dependencies"
import {
  TiFLocation,
  LocationCoordinate2D,
  LocationSearchResult,
  mockExpoLocationObject,
  mockLocationCoordinate2D,
  mockLocationSearchResult,
  LocationsSearchQuery
} from "@lib/location"
import {
  LocationSearchBar,
  LocationSearchDependencyKeys,
  LocationSearchPicker,
  LocationSearchResultView,
  LocationSearchResultsListView
} from "@screens/LocationSearch"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import "../helpers/Matchers"
import { neverPromise } from "../helpers/Promise"
import { TestQueryClientProvider } from "../helpers/ReactQuery"
import { View } from "react-native"
import { fakeTimers } from "../helpers/Timers"
import { LocationObject } from "expo-location"

describe("LocationSearch tests", () => {
  describe("LocationsSearchQuery tests", () => {
    test("query type", () => {
      expect(new LocationsSearchQuery("").queryType).toEqual("user-recents")
      expect(new LocationsSearchQuery("New York").queryType).toEqual(
        "remote-search"
      )
    })
  })

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

    describe("SearchResultView tests", () => {
      it("should display the distance from the option in miles", () => {
        const { queryByText } = renderSearchResult(
          mockLocationSearchResult(),
          12.3
        )
        expect(queryByText("12.3 mi")).toBeDisplayed()
      })

      it("should display the distance from the option in feet when small distance", () => {
        const { queryByText } = renderSearchResult(
          mockLocationSearchResult(),
          0.03
        )
        expect(queryByText("158 ft")).toBeDisplayed()
      })

      const renderSearchResult = (
        result: LocationSearchResult,
        distanceMiles: number
      ) => {
        return render(
          <LocationSearchResultView
            result={result}
            distanceMiles={distanceMiles}
          />
        )
      }
    })

    describe("SearchResultsList tests", () => {
      fakeTimers()

      it("should indicate an error when loading options fails", async () => {
        searchForLocations.mockRejectedValue(new Error())
        renderResultsList()
        await waitFor(() => expect(errorIndicator()).toBeDisplayed())
      })

      it("should indicate that there are no recents when no options available with empty search", async () => {
        searchForLocations.mockResolvedValue([])
        renderResultsList()
        await waitFor(() => expect(noRecentsIndicator()).toBeDisplayed())
      })

      it("should debounce when search text changes", async () => {
        const center = mockLocationCoordinate2D()
        searchForLocations.mockImplementation(neverPromise)
        renderResultsList(center)

        let searchText = "Hello World!"
        enterSearchText(searchText)

        jest.advanceTimersByTime(100)
        await waitFor(() => {
          expect(searchForLocations).not.toHaveBeenCalledWith(
            searchText,
            center
          )
        })

        searchText = "The user changed the text while typing or something..."
        enterSearchText(searchText)

        act(() => jest.advanceTimersByTime(100))
        expect(searchForLocations).not.toHaveBeenCalledWith(searchText, center)

        act(() => jest.advanceTimersByTime(100))
        expect(searchForLocations).toHaveBeenCalledWith(searchText, center)
      })

      it("should indicate that no results were found when no options available with non-empty search", async () => {
        searchForLocations.mockResolvedValue([])
        renderResultsList()

        const searchText = "Chuck E. Cheese"
        enterSearchText(searchText)
        await waitFor(() => {
          expect(noResultsIndicator(searchText)).toBeDisplayed()
        })
      })

      it("displays a loading indicator when searched results have not yet loaded", async () => {
        searchForLocations.mockImplementation(neverPromise)
        renderResultsList()
        await waitFor(() => expect(loadingIndicator()).toBeDisplayed())
      })

      it("displays the searched locations with their distance from the center", async () => {
        const center = { latitude: 45.0, longitude: 45.0 }
        const searchResult1 = mockLocationSearchResult({
          latitude: 53.0,
          longitude: -12.0
        })
        const searchResult2 = mockLocationSearchResult(center)
        searchForLocations.mockResolvedValue([searchResult1, searchResult2])
        renderResultsList(center)

        await waitFor(() => {
          expect(
            searchResultWithNameAndTruncatedDistance(
              searchResult1.location.placemark.name!,
              2570
            )
          ).toBeDisplayed()

          expect(
            searchResultWithNameAndTruncatedDistance(
              searchResult2.location.placemark.name!,
              0
            )
          ).toBeDisplayed()
        })
      })

      const searchForLocations = jest.fn().mockImplementation(neverPromise)

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

      const searchBarPlaceholder = "Test Search"

      const enterSearchText = (text: string) => {
        fireEvent.changeText(
          screen.getByPlaceholderText(searchBarPlaceholder),
          text
        )
      }

      const searchResultWithNameAndTruncatedDistance = (
        name: string,
        truncatedDistance: number
      ) => {
        return screen.queryByTestId(`${name} | ${truncatedDistance}`)
      }

      const searchResultTestId = (name: string, distance?: number) => {
        return `${name} | ${Math.trunc(distance ?? 0.0)}`
      }

      const renderResultsList = (center?: LocationCoordinate2D) => {
        return render(
          <TestQueryClientProvider>
            <SetDependencyValue
              forKey={LocationSearchDependencyKeys.searchForResults}
              value={searchForLocations}
            >
              <LocationSearchBar
                onBackTapped={jest.fn()}
                placeholder={searchBarPlaceholder}
              />
              <LocationSearchResultsListView
                center={center}
                renderSearchResult={(result, distance) => (
                  <View
                    testID={searchResultTestId(
                      result.location.placemark.name!,
                      distance
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
      it("can select the user's coordinates when user coordinates available", async () => {
        const userLocation = mockExpoLocationObject()
        queryUserCoordinates.mockResolvedValue(userLocation)
        renderPicker()

        await selectUserLocation()
        expect(selectedUserLocationObject).toMatchObject(userLocation)
      })

      test("when option is selected, it is also saved somewhere", async () => {
        const searchResult = mockLocationSearchResult()
        searchForLocations.mockResolvedValue([searchResult])
        renderPicker()

        await selectLocationWithName(searchResult.location.placemark.name!)
        expect(selectedLocation).toMatchObject(searchResult.location)
        expect(saveSelection).toHaveBeenCalledWith(searchResult.location)
      })

      const searchForLocations = jest.fn().mockImplementation(neverPromise)
      const queryUserCoordinates = jest.fn().mockImplementation(neverPromise)
      const saveSelection = jest.fn()

      let selectedUserLocationObject: LocationObject
      let selectedLocation: TiFLocation

      const selectUserLocation = async () => {
        return fireEvent.press(await screen.findByText("Use current location"))
      }

      const selectLocationWithName = async (name: string) => {
        return fireEvent.press(await screen.findByText(name))
      }

      const renderPicker = () => {
        return render(
          <TestQueryClientProvider>
            <UpdateDependencyValues
              update={(values) => {
                values.set(
                  LocationSearchDependencyKeys.searchForResults,
                  searchForLocations
                )
                values.set(
                  LocationSearchDependencyKeys.savePickerSelection,
                  saveSelection
                )
              }}
            >
              <UserLocationFunctionsProvider
                getCurrentLocation={queryUserCoordinates}
                requestForegroundPermissions={jest.fn()}
              >
                <LocationSearchPicker
                  onUserLocationSelected={(coordinates) => {
                    selectedUserLocationObject = coordinates
                  }}
                  onLocationSelected={(location) =>
                    (selectedLocation = location)
                  }
                />
              </UserLocationFunctionsProvider>
            </UpdateDependencyValues>
          </TestQueryClientProvider>
        )
      }
    })
  })
})
