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
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { neverPromise } from "./helpers/Promise"
import { emptyCancellable } from "@lib/Cancellable"
import { EventMocks } from "@lib/events"
import { UpdateDependencyValues } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { SAN_FRANCISCO_DEFAULT_REGION } from "@screens/ExploreEvents/models"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should use the initial provided region when fetching for first time", async () => {
      fetchEvents.mockReturnValue(
        emptyCancellable(Promise.resolve([EventMocks.Multiday]))
      )
      const coordinates = mockLocationCoordinate2D()
      const { result } = renderUseExploreEvents({ type: "preset", coordinates })

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(coordinates)
        )
      })
      await waitFor(() => {
        expect(result.current.events.data).toMatchObject([EventMocks.Multiday])
      })
    })

    it("should not request location permissions if initial coordinates provided", async () => {
      fetchEvents.mockReturnValue(emptyCancellable(neverPromise()))

      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents({ type: "preset", coordinates })

      await waitFor(() => {
        expect(requestForegroundPermissions).not.toHaveBeenCalled()
      })
    })

    it("should be able to fetch events based on the user's location if user accepted location foreground permissions", async () => {
      fetchEvents.mockReturnValue(
        emptyCancellable(Promise.resolve([EventMocks.Multiday]))
      )
      requestForegroundPermissions.mockResolvedValue(true)
      const userLocation = mockTrackedLocationCoordinate()
      queryUserCoordinates.mockResolvedValue(userLocation)
      const { result } = renderUseExploreEvents({ type: "user-location" })

      await waitFor(() => {
        expect(queryUserCoordinates).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(userLocation.coordinates)
        )
      })
      await waitFor(() => {
        expect(result.current.events.data).toMatchObject([EventMocks.Multiday])
      })
    })

    it("should use sanfrancisco as the default region when user denies foreground location permissions", async () => {
      fetchEvents.mockReturnValue(
        emptyCancellable(Promise.resolve([EventMocks.Multiday]))
      )
      requestForegroundPermissions.mockResolvedValue(false)
      const { result } = renderUseExploreEvents({ type: "user-location" })

      await waitFor(() => {
        expect(requestForegroundPermissions).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
      await waitFor(() => {
        expect(result.current.events.data).toMatchObject([EventMocks.Multiday])
      })
    })

    it("should use sanfrancisco as the default region when user location fetch errors", async () => {
      fetchEvents.mockReturnValue(
        emptyCancellable(Promise.resolve([EventMocks.Multiday]))
      )
      requestForegroundPermissions.mockResolvedValue(true)
      queryUserCoordinates.mockRejectedValue(new Error())
      const { result } = renderUseExploreEvents({ type: "user-location" })

      await waitFor(() => {
        expect(queryUserCoordinates).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
      await waitFor(() => {
        expect(result.current.events.data).toMatchObject([EventMocks.Multiday])
      })
    })

    it("should not refetch events at new region when new region is not significantly different from current region", async () => {
      fetchEvents.mockReturnValue(emptyCancellable(neverPromise()))
      isSignificantlyDifferentRegions.mockReturnValue(false)
      const { result } = renderUseExploreEvents({
        type: "preset",
        coordinates: mockLocationCoordinate2D()
      })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(region)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(region)
      })
    })

    it("should refetch events at updated region after debounce period", async () => {
      fetchEvents.mockReturnValue(emptyCancellable(neverPromise()))
      isSignificantlyDifferentRegions.mockReturnValue(true)
      const { result } = renderUseExploreEvents({
        type: "preset",
        coordinates: mockLocationCoordinate2D()
      })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(region)
      })
      advanceThroughRegionUpdateDebounce()
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(region)
      })
    })

    it("should fetch with no debounce when region updates when current region is non-existent", async () => {
      fetchEvents.mockReturnValue(emptyCancellable(neverPromise()))
      const { result } = renderUseExploreEvents({ type: "user-location" })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(region)
      })
    })

    it("should cancel the existing fetch immediatedly when significant region change", async () => {
      const cancel = jest.fn()
      fetchEvents.mockReturnValue({ promise: neverPromise(), cancel })
      isSignificantlyDifferentRegions.mockReturnValue(true)

      const { result } = renderUseExploreEvents({
        type: "preset",
        coordinates: mockLocationCoordinate2D()
      })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => expect(cancel).toHaveBeenCalled())
    })

    const advanceThroughRegionUpdateDebounce = () => {
      act(() => jest.advanceTimersByTime(300))
    }

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
            <TestQueryClientProvider>
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

  describe("ExploreEventsView tests", () => {})
})
