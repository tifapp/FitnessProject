import {
  Location,
  LocationCoordinate2D,
  TrackedLocationCoordinates,
  mockLocationCoordinate2D,
  mockTrackedLocationCoordinate
} from "@lib/location"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import {
  LocationSearchBar,
  LocationSearchDependencyKeys,
  mockLocationSearchResult,
  LocationSearchPicker,
  LocationSearchResult,
  LocationSearchResultView,
  LocationSearchResultsListView
} from "@screens/LocationSearch"
import { SetDependencyValue, UpdateDependencyValues } from "@lib/dependencies"
import "../helpers/Matchers"
import {
  TestQueryClientProvider,
  cleanupTestQueryClient,
  createTestQueryClient
} from "../helpers/ReactQuery"
import { neverPromise } from "../helpers/Promise"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { View } from "react-native"

const queryClient = createTestQueryClient()

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

    describe("SearchResultView tests", () => {
      it("should display the distance from the option in miles", () => {
        const { queryByText } = renderOption(mockLocationSearchResult(), 12.3)
        expect(queryByText("12.3 mi")).toBeDisplayed()
      })

      it("should display the distance from the option in feet when small distance", () => {
        const { queryByText } = renderOption(mockLocationSearchResult(), 0.03)
        expect(queryByText("158 ft")).toBeDisplayed()
      })

      const renderOption = (
        option: LocationSearchResult,
        distanceMiles: number
      ) => {
        return render(
          <LocationSearchResultView
            option={option}
            distanceMiles={distanceMiles}
          />
        )
      }
    })

    describe("SearchResultsList tests", () => {
      beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
      })
      afterEach(() => jest.useRealTimers())

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

      afterAll(() => cleanupTestQueryClient(queryClient))

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
          <TestQueryClientProvider client={queryClient}>
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
        const trackedUserCoordinates = mockTrackedLocationCoordinate()
        queryUserCoordinates.mockResolvedValue(trackedUserCoordinates)
        renderPicker()

        await selectUserLocation()
        expect(selectedUserCoordinates).toMatchObject(trackedUserCoordinates)
      })

      test("when option is selected, it is also saved somewhere", async () => {
        const searchResult = mockLocationSearchResult()
        searchForLocations.mockResolvedValue([searchResult])
        renderPicker()

        await selectLocationWithName(searchResult.location.placemark.name!)
        expect(selectedLocation).toMatchObject(searchResult.location)
        expect(saveSelection).toHaveBeenCalledWith(searchResult.location)
      })

      afterAll(() => cleanupTestQueryClient(queryClient))

      const searchForLocations = jest.fn().mockImplementation(neverPromise)
      const queryUserCoordinates = jest.fn().mockImplementation(neverPromise)
      const saveSelection = jest.fn()

      let selectedUserCoordinates: TrackedLocationCoordinates
      let selectedLocation: Location

      const selectUserLocation = async () => {
        return fireEvent.press(await screen.findByText("Use current location"))
      }

      const selectLocationWithName = async (name: string) => {
        return fireEvent.press(await screen.findByText(name))
      }

      const renderPicker = () => {
        return render(
          <TestQueryClientProvider client={queryClient}>
            <UpdateDependencyValues
              update={(values) => {
                values.set(
                  UserLocationDependencyKeys.currentCoordinates,
                  queryUserCoordinates
                )
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
              <LocationSearchPicker
                onUserCoordinatesSelected={(coordinates) => {
                  selectedUserCoordinates = coordinates
                }}
                onLocationSelected={(location) => (selectedLocation = location)}
              />
            </UpdateDependencyValues>
          </TestQueryClientProvider>
        )
      }
    })
  })
})
