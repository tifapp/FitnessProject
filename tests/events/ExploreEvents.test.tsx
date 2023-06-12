import {
  mockLocationCoordinate2D,
  mockRegion,
  mockTrackedLocationCoordinate
} from "@lib/location"
import {
  ExploreEventsInitialCenter,
  useExploreEvents
} from "@screens/ExploreEvents"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "../helpers/ReactQuery"
import { UpdateDependencyValues } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import {
  SAN_FRANCISCO_DEFAULT_REGION,
  createInitialCenter
} from "@screens/ExploreEvents/models"
import { nonCancellable, endlessCancellable } from "../helpers/Cancellable"
import { EventMocks } from "@lib/events"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("ExploreEventsInitialCenter tests", () => {
    describe("CoordinateToInitialCenter tests", () => {
      it("should be user-location when undefined", () => {
        expect(createInitialCenter(undefined)).toMatchObject({
          center: "user-location"
        })
      })

      it("should be preset when coordinates passed", () => {
        const coordinate = mockLocationCoordinate2D()
        expect(createInitialCenter(coordinate)).toMatchObject({
          center: "preset",
          coordinate
        })
      })
    })
  })

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should use the initial provided region when fetching for first time", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents({ center: "preset", coordinate: coordinates })

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(coordinates)
        )
      })
    })

    it("should not request location permissions if initial coordinates provided", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())

      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents({ center: "preset", coordinate: coordinates })

      await waitFor(() => {
        expect(requestForegroundPermissions).not.toHaveBeenCalled()
      })
    })

    it("should be able to fetch events based on the user's location if user accepted location foreground permissions", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      requestForegroundPermissions.mockResolvedValue(true)
      const userLocation = mockTrackedLocationCoordinate()
      queryUserCoordinates.mockResolvedValue(userLocation)

      renderUseExploreEvents({ center: "user-location" })

      await waitForUserRegionToLoad()
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(userLocation.coordinates)
        )
      })
    })

    it("should use sanfrancisco as the default region when user denies foreground location permissions", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      requestForegroundPermissions.mockResolvedValue(false)

      renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expect(requestForegroundPermissions).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
    })

    it("should use sanfrancisco as the default region when user location fetch errors", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      requestForegroundPermissions.mockResolvedValue(true)
      queryUserCoordinates.mockRejectedValue(new Error())

      renderUseExploreEvents({ center: "user-location" })

      await waitForUserRegionToLoad()
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
    })

    it("should not refetch events at new region when new region is not significantly different from current region", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      isSignificantlyDifferentRegions.mockReturnValue(false)
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      const updatedRegion = mockRegion()
      act(() => result.current.updateRegion(updatedRegion))

      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(updatedRegion)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(updatedRegion)
      })
    })

    it("should refetch events at updated region after debounce period", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      isSignificantlyDifferentRegions.mockReturnValue(true)
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      const updatedRegion = mockRegion()
      act(() => result.current.updateRegion(updatedRegion))

      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(updatedRegion)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(updatedRegion)
      })
    })

    it("should fetch with no debounce when region updates when current region is non-existent", async () => {
      fetchEvents.mockReturnValue(endlessCancellable())
      const { result } = renderUseExploreEvents({ center: "user-location" })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(region)
      })
    })

    it("should cancel the existing fetch immediatedly when significant region change", async () => {
      const cancellable = endlessCancellable()
      fetchEvents.mockReturnValue(cancellable)
      isSignificantlyDifferentRegions.mockReturnValue(true)

      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => expect(cancellable.cancel).toHaveBeenCalled())
    })

    it("should seed the query cache with an entry for each individual loaded event", async () => {
      const events = [EventMocks.Multiday, EventMocks.PickupBasketball]
      fetchEvents.mockReturnValue(nonCancellable(Promise.resolve(events)))

      renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => expect(fetchEvents).toHaveBeenCalled())
      expect(queryClient.getQueryData(["event", events[0].id])).toMatchObject(
        events[0]
      )
      expect(queryClient.getQueryData(["event", events[1].id])).toMatchObject(
        events[1]
      )
    })

    const waitForUserRegionToLoad = async () => {
      await waitFor(() => {
        expect(queryUserCoordinates).toHaveBeenCalled()
      })
    }

    const advanceThroughRegionUpdateDebounce = () => {
      act(() => jest.advanceTimersByTime(300))
    }

    const queryClient = createTestQueryClient()

    const requestForegroundPermissions = jest.fn()
    const queryUserCoordinates = jest.fn()
    const isSignificantlyDifferentRegions = jest.fn()
    const fetchEvents = jest.fn()

    const renderUseExploreEvents = (center: ExploreEventsInitialCenter) => {
      return renderHook(
        () =>
          useExploreEvents(center, {
            fetchEvents,
            isSignificantlyDifferentRegions
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider client={queryClient}>
              <UpdateDependencyValues
                update={(values) => {
                  values.set(
                    UserLocationDependencyKeys.currentCoordinates,
                    queryUserCoordinates
                  )
                  values.set(
                    UserLocationDependencyKeys.requestForegroundPermissions,
                    requestForegroundPermissions
                  )
                }}
              >
                {children}
              </UpdateDependencyValues>
            </TestQueryClientProvider>
          )
        }
      )
    }
  })
})
