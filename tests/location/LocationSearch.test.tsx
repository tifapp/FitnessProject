import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import {
  TiFLocation,
  LocationSearchResult,
  mockExpoLocationObject,
  mockLocationSearchResult,
  LocationsSearchQuery
} from "@lib/location"
import {
  LocationSearchBar,
  LocationSearchPicker,
  LocationSearchResultProps,
  LocationSearchResultView,
  useLocationSearchPicker
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
  beforeEach(() => jest.resetAllMocks())

  describe("LocationsSearchQuery tests", () => {
    test("sourceType", () => {
      expect(LocationsSearchQuery.empty.sourceType).toEqual("user-recents")
      expect(new LocationsSearchQuery("New York").sourceType).toEqual(
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

    describe("Picker tests", () => {
      fakeTimers()

      test("loading results at the user's location", async () => {
        const userLocation = mockExpoLocationObject()
        queryUserCoordinates.mockResolvedValueOnce(userLocation)

        const searchResult = mockLocationSearchResult()
        searchForLocations
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([searchResult])

        renderPicker()

        await waitForCurrentLocationOptionToLoad()

        expect(
          await waitForLocationWithName(searchResult.location.placemark.name!)
        ).toBeDisplayed()
        expect(searchForLocations).toHaveBeenCalledWith(
          LocationsSearchQuery.empty,
          userLocation.coords
        )
      })

      it("can select the user's coordinates when user coordinates available", async () => {
        const userLocation = mockExpoLocationObject()
        queryUserCoordinates.mockResolvedValueOnce(userLocation)
        searchForLocations.mockImplementation(neverPromise)
        renderPicker()

        await selectUserLocation()
        expect(selectedUserLocationObject).toMatchObject(userLocation)
      })

      test("when option is selected, it is also saved somewhere", async () => {
        const searchResult = mockLocationSearchResult()
        searchForLocations.mockResolvedValueOnce([searchResult])
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        renderPicker()

        await waitToSelectLocationWithName(
          searchResult.location.placemark.name!
        )
        expect(selectedLocation).toMatchObject(searchResult.location)
        expect(savedLocation).toMatchObject(searchResult.location)
      })

      it("should indicate an error when loading options fails", async () => {
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        searchForLocations.mockRejectedValueOnce(new Error())
        renderPicker()
        await waitFor(() => expect(errorIndicator()).toBeDisplayed())
      })

      it("should indicate that there are no recents when no options available with empty search", async () => {
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        searchForLocations.mockResolvedValueOnce([])
        renderPicker()
        await waitFor(() => expect(noRecentsIndicator()).toBeDisplayed())
      })

      it("should debounce when search text changes", async () => {
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        const result = mockLocationSearchResult()
        searchForLocations
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([result])
        renderPicker()

        let searchText = "Hello World!"
        enterSearchText(searchText)

        jest.advanceTimersByTime(100)
        await waitFor(() => {
          expect(searchForLocations).not.toHaveBeenCalledWith(
            new LocationsSearchQuery(searchText),
            undefined
          )
        })

        searchText = "The user changed the text while typing or something..."
        enterSearchText(searchText)

        act(() => jest.advanceTimersByTime(100))
        expect(searchForLocations).not.toHaveBeenCalledWith(
          new LocationsSearchQuery(searchText),
          undefined
        )

        act(() => jest.advanceTimersByTime(100))
        expect(searchForLocations).toHaveBeenCalledWith(
          new LocationsSearchQuery(searchText),
          undefined
        )
        expect(
          await waitForLocationWithName(result.location.placemark.name!)
        ).toBeDisplayed()
      })

      it("should indicate that no results were found when no options available with non-empty search", async () => {
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        searchForLocations
          .mockResolvedValueOnce([mockLocationSearchResult()])
          .mockResolvedValueOnce([])
        renderPicker()

        const searchText = "Chuck E. Cheese"
        enterSearchText(searchText)
        await waitFor(() => {
          expect(noResultsIndicator(searchText)).toBeDisplayed()
        })
      })

      it("displays a loading indicator when searched results have not yet loaded", async () => {
        queryUserCoordinates.mockRejectedValueOnce(new Error())
        searchForLocations.mockImplementation(neverPromise)
        renderPicker()
        await waitFor(() => expect(loadingIndicator()).toBeDisplayed())
      })

      it("displays the searched locations with their distance from the center", async () => {
        const userLocation = mockExpoLocationObject({
          latitude: 45.0,
          longitude: 45.0
        })
        const searchResult1 = mockLocationSearchResult({
          latitude: 53.0,
          longitude: -12.0
        })
        const searchResult2 = mockLocationSearchResult(userLocation.coords)
        searchForLocations.mockResolvedValue([searchResult1, searchResult2])
        queryUserCoordinates.mockResolvedValue(userLocation)
        renderPicker()

        await waitForCurrentLocationOptionToLoad()

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

      const searchForLocations = jest.fn()
      const queryUserCoordinates = jest.fn()

      let selectedUserLocationObject: LocationObject
      let selectedLocation: TiFLocation
      let savedLocation: TiFLocation

      const waitForCurrentLocationOptionToLoad = async () => {
        expect(await userLocationOptionLabel()).toBeDisplayed()
      }

      const selectUserLocation = async () => {
        return fireEvent.press(await userLocationOptionLabel())
      }

      const userLocationOptionLabel = async () => {
        return await screen.findByText("Use current location")
      }

      const waitToSelectLocationWithName = async (name: string) => {
        return fireEvent.press(await waitForLocationWithName(name))
      }

      const waitForLocationWithName = async (name: string) => {
        return await screen.findByText(name)
      }

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

      const TestView = () => {
        const picker = useLocationSearchPicker({
          loadSearchResults: searchForLocations
        })
        return (
          <LocationSearchPicker
            {...picker}
            savePickedLocation={(location) => (savedLocation = location)}
            onUserLocationSelected={(coordinates) => {
              selectedUserLocationObject = coordinates
            }}
            onLocationSelected={(location) => (selectedLocation = location)}
            SearchResultView={(props: LocationSearchResultProps) => (
              <View
                testID={searchResultTestId(
                  props.result.location.placemark.name!,
                  props.distanceMiles
                )}
              >
                <LocationSearchResultView {...props} />
              </View>
            )}
          />
        )
      }

      const renderPicker = () => {
        return render(
          <TestQueryClientProvider>
            <UserLocationFunctionsProvider
              getCurrentLocation={queryUserCoordinates}
              requestForegroundPermissions={jest.fn()}
            >
              <LocationSearchBar
                onBackTapped={jest.fn()}
                placeholder={searchBarPlaceholder}
              />
              <TestView />
            </UserLocationFunctionsProvider>
          </TestQueryClientProvider>
        )
      }
    })
  })
})
