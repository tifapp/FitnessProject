import {
  LocationCoordinate2D,
  Region,
  mockLocationCoordinate2D,
  mockRegion,
  mockTrackedLocationCoordinate
} from "@lib/location"
import { useExploreEvents } from "@screens/ExploreEvents"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { neverPromise } from "./helpers/Promise"
import { SetDependencyValue } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should use the initial provided region when fetching for first time", async () => {
      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents(coordinates)
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(coordinates)
        )
      })
    })

    it("does not attempt to fetch the user's location when initial center provided", async () => {
      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents(coordinates)
      await waitFor(() => {
        expect(queryUserCoordinates).not.toHaveBeenCalled()
      })
    })

    it("should use the user's location as the default center when no initial center is provided", async () => {
      const trackedCoordinates = mockTrackedLocationCoordinate()
      queryUserCoordinates.mockResolvedValue(trackedCoordinates)
      renderUseExploreEvents()
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(trackedCoordinates.coordinates)
        )
      })
    })

    it("should not refetch events at new region when new region is not significantly different from current region", async () => {
      fetchEvents.mockImplementation(neverPromise)
      isSignificantlyDifferentRegions.mockReturnValue(false)
      const { result } = renderUseExploreEvents(mockLocationCoordinate2D())

      const region = mockRegion()
      act(() => result.current.regionUpdated(region))

      await waitFor(() => {
        expect(queryUserCoordinates).not.toHaveBeenCalledWith(region)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(queryUserCoordinates).not.toHaveBeenCalledWith(region)
      })
    })

    it("should refetch events at updated region after debounce period", async () => {
      let latestRegion: Region | undefined
      fetchEvents.mockImplementation(async (r) => {
        latestRegion = r
        return await neverPromise()
      })
      isSignificantlyDifferentRegions.mockReturnValue(true)
      const { result } = renderUseExploreEvents(mockLocationCoordinate2D())

      const region = mockRegion()
      act(() => result.current.regionUpdated(region))

      await waitFor(() => {
        expect(queryUserCoordinates).not.toHaveBeenCalledWith(region)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(latestRegion).toMatchObject(region)
      })
    })

    const advanceThroughRegionUpdateDebounce = () => {
      act(() => jest.advanceTimersByTime(300))
    }

    const queryUserCoordinates = jest.fn()

    const isSignificantlyDifferentRegions = jest.fn()

    const fetchEvents = jest.fn()

    const renderUseExploreEvents = (center?: LocationCoordinate2D) => {
      return renderHook(
        () =>
          useExploreEvents(center, {
            fetchEvents,
            isSignificantlyDifferentRegions
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>
              <SetDependencyValue
                forKey={UserLocationDependencyKeys.currentCoordinates}
                value={queryUserCoordinates}
              >
                {children}
              </SetDependencyValue>
            </TestQueryClientProvider>
          )
        }
      )
    }
  })
})
