import {
  Location,
  TrackedLocationCoordinates,
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
  LocationSearchBar,
  LocationSearchDependencyKeys,
  mockLocationSearchResult,
  LocationSearchPicker,
  LocationSearchResult,
  LocationSearchResultView
} from "@screens/LocationSearch"
import { UpdateDependencyValues } from "@lib/dependencies"
import "../helpers/Matchers"
import {
  TestQueryClientProvider,
  cleanupTestQueryClient,
  createTestQueryClient
} from "../helpers/ReactQuery"
import { neverPromise } from "../helpers/Promise"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"

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

    describe("OptionView tests", () => {
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

    describe("Picker tests", () => {
      beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
      })
      afterEach(() => jest.useRealTimers())

      it("should indicate an error when loading options fails", async () => {
        loadLocationOptions.mockRejectedValue(new Error())
        renderPicker()
        await waitFor(() => expect(errorIndicator()).toBeDisplayed())
      })

      it("should indicate that there are no recents when no options available with empty search", async () => {
        loadLocationOptions.mockResolvedValue([])
        renderPicker()
        await waitFor(() => expect(noRecentsIndicator()).toBeDisplayed())
      })

      it("should debounce when search text changes", async () => {
        const trackedUserCoordinates = mockTrackedLocationCoordinate()
        queryUserCoordinates.mockResolvedValue(trackedUserCoordinates)
        loadLocationOptions.mockImplementation(neverPromise)
        renderPicker()

        let searchText = "Hello World!"
        enterSearchText(searchText)

        jest.advanceTimersByTime(100)
        await waitFor(() => {
          expect(loadLocationOptions).not.toHaveBeenCalledWith(
            searchText,
            trackedUserCoordinates.coordinates
          )
        })

        searchText = "The user changed the text while typing or something..."
        enterSearchText(searchText)

        jest.advanceTimersByTime(100)
        await waitFor(() => {
          expect(loadLocationOptions).not.toHaveBeenCalledWith(
            searchText,
            trackedUserCoordinates.coordinates
          )
        })

        jest.advanceTimersByTime(100)
        await waitFor(() => {
          expect(loadLocationOptions).toHaveBeenCalledWith(
            searchText,
            trackedUserCoordinates.coordinates
          )
        })
      })

      it("should indicate that no results were found when no options available with non-empty search", async () => {
        loadLocationOptions.mockResolvedValue([])
        renderPicker()

        const searchText = "Chuck E. Cheese"
        enterSearchText(searchText)
        await waitFor(() => {
          expect(noResultsIndicator(searchText)).toBeDisplayed()
        })
      })

      it("displays a loading indicator when searched results have not yet loaded", async () => {
        loadLocationOptions.mockImplementation(neverPromise)
        renderPicker()
        await waitFor(() => expect(loadingIndicator()).toBeDisplayed())
      })

      it("can select the user's coordinates when user coordinates available", async () => {
        const trackedUserCoordinates = mockTrackedLocationCoordinate()
        queryUserCoordinates.mockResolvedValue(trackedUserCoordinates)

        renderPicker()
        await selectUserLocation()
        await waitFor(() => {
          expect(selectedUserCoordinates).toMatchObject(trackedUserCoordinates)
        })
      })

      test("when option is selected, it is also saved somewhere", async () => {
        const locationOptions = [
          mockLocationSearchResult(),
          mockLocationSearchResult(),
          mockLocationSearchResult()
        ]
        loadLocationOptions.mockResolvedValue(locationOptions)
        renderPicker()

        locationOptions.forEach(async (option) => {
          await selectLocationWithName(option.location.placemark.name!)
          await waitFor(() => {
            expect(selectedLocation).toMatchObject(option.location)
            expect(saveSelection).toHaveBeenCalledWith(option.location)
          })
        })
      })

      afterAll(() => cleanupTestQueryClient(queryClient))

      const loadLocationOptions = jest.fn().mockImplementation(neverPromise)
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
                  loadLocationOptions
                )
                values.set(
                  LocationSearchDependencyKeys.savePickerSelection,
                  saveSelection
                )
              }}
            >
              <LocationSearchBar
                onBackTapped={jest.fn()}
                placeholder={searchBarPlaceholder}
              />
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
