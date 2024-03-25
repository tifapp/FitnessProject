import { EventMocks } from "@event-details/MockData"
import {
  mockExpoLocationObject,
  mockLocationCoordinate2D,
  mockRegion
} from "@location/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import { eventDetailsQueryKey } from "@shared-models/query-keys/Event"
import { endlessCancellable, nonCancellable } from "@test-helpers/Cancellable"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { timeTravel, fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  createInitialCenter,
  createDefaultMapRegion,
  SAN_FRANCISCO_DEFAULT_REGION,
  ExploreEventsInitialCenter
} from "./models"
import { useExploreEvents } from "./useExploreEvents"
import { renderUseLoadEventDetails } from "@event-details/TestHelpers"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { neverPromise } from "@test-helpers/Promise"
import { EventID } from "@shared-models/Event"

const TEST_EVENTS = [EventMocks.Multiday, EventMocks.PickupBasketball]

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
    const queryClient = createTestQueryClient()
    beforeEach(() => queryClient.clear())
    fakeTimers()

    test("exploring events successfully at user location", async () => {
      const userLocation = mockExpoLocationObject()
      const expectedRegion = createDefaultMapRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      })

      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockReturnValueOnce(userLocation)
      fetchEvents.mockReturnValueOnce(
        nonCancellable(Promise.resolve(TEST_EVENTS))
      )

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => expect(result.current.data.status).toEqual("loading"))

      await waitFor(() => expect(result.current.region).toEqual(expectedRegion))

      await waitFor(() => expect(result.current.data.status).toEqual("success"))
      expect(result.current.data.events).toEqual(TEST_EVENTS)
      expect(fetchEvents).toHaveBeenCalledWith(expectedRegion)
    })

    test("retrying after unsuccessfully exploring events", async () => {
      fetchEvents
        .mockReturnValueOnce(nonCancellable(Promise.reject(new Error())))
        .mockReturnValueOnce(
          nonCancellable(Promise.resolve([EventMocks.Multiday]))
        )

      const coordinate = mockLocationCoordinate2D()
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate
      })

      await waitFor(() => {
        expect(result.current.data.status).toEqual("error")
      })

      await act(async () => (result.current.data as any).retry())

      await waitFor(() => {
        expect(result.current.data.status).toEqual("success")
      })
    })

    it("should be in a no-results state when no events for region", async () => {
      fetchEvents.mockReturnValueOnce(nonCancellable(Promise.resolve([])))
      const coordinate = mockLocationCoordinate2D()
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate
      })
      await waitFor(() => {
        expect(result.current.data.events).toEqual([])
      })
      expect(result.current.data.status).toEqual("no-results")
    })

    it("should use the initial provided region when fetching for first time", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      const coordinates = mockLocationCoordinate2D()
      const expectedRegion = createDefaultMapRegion(coordinates)
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: coordinates
      })

      await waitFor(() => {
        expect(result.current.region).toMatchObject(expectedRegion)
      })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(expectedRegion)
      })
    })

    it("should not request location permissions if initial coordinates provided", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())

      renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => {
        expect(requestForegroundPermissions).not.toHaveBeenCalled()
      })
    })

    it("should use sanfrancisco as the default region when user denies foreground location permissions", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      requestForegroundPermissions.mockResolvedValueOnce({ granted: false })

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(SAN_FRANCISCO_DEFAULT_REGION)
    })

    it("should use sanfrancisco as the default region when user location fetch errors", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockRejectedValueOnce(new Error())

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(SAN_FRANCISCO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(SAN_FRANCISCO_DEFAULT_REGION)
    })

    it("should maintain current region when new region is not significantly different", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      isSignificantlyDifferentRegions.mockReturnValueOnce(false)
      const coordinate = mockLocationCoordinate2D()
      const initialRegion = createDefaultMapRegion(coordinate)
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate
      })

      const updatedRegion = mockRegion()
      act(() => result.current.updateRegion(updatedRegion))

      advanceThroughRegionUpdateDebounce()
      expect(result.current.region).toMatchObject(initialRegion)
      await waitFor(() => {
        expect(fetchEvents).not.toHaveBeenCalledWith(updatedRegion)
      })
    })

    it("should update to new region after debounce period if new region is significantly different", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      isSignificantlyDifferentRegions.mockReturnValueOnce(true)
      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      const updatedRegion = mockRegion()
      act(() => result.current.updateRegion(updatedRegion))

      advanceThroughRegionUpdateDebounce()
      expect(result.current.region).toMatchObject(updatedRegion)
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(updatedRegion)
      })
    })

    it("should region update region immediately when current region is non-existent", async () => {
      fetchEvents.mockReturnValueOnce(endlessCancellable())
      const { result } = renderUseExploreEvents({ center: "user-location" })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      expect(result.current.region).toMatchObject(region)
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(region)
      })
    })

    it("should cancel the existing fetch immediatedly when significant region change", async () => {
      const cancellable = endlessCancellable()
      fetchEvents.mockReturnValueOnce(cancellable)
      isSignificantlyDifferentRegions.mockReturnValueOnce(true)

      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => expect(fetchEvents).toHaveBeenCalled())

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => expect(cancellable.cancel).toHaveBeenCalled())
    })

    it("should seed the query cache with an entry for each individual loaded event", async () => {
      const events = [EventMocks.Multiday, EventMocks.PickupBasketball]
      fetchEvents.mockReturnValueOnce(nonCancellable(Promise.resolve(events)))

      const { result: event1Result } = renderEventDetails(events[0].id)
      const { result: event2Result } = renderEventDetails(events[1].id)

      renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => {
        expect(event1Result.current).toMatchObject({
          status: "success",
          event: events[0]
        })
      })
      await waitFor(() => {
        expect(event2Result.current).toMatchObject({
          status: "success",
          event: events[1]
        })
      })
    })

    const renderEventDetails = (id: EventID) => {
      return renderUseLoadEventDetails(
        id,
        new TestInternetConnectionStatus(true),
        neverPromise,
        queryClient
      )
    }

    const advanceThroughRegionUpdateDebounce = () => {
      act(() => timeTravel(300))
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
            <TestQueryClientProvider client={queryClient}>
              <UserLocationFunctionsProvider
                getCurrentLocation={queryUserCoordinates}
                requestForegroundPermissions={requestForegroundPermissions}
              >
                {children}
              </UserLocationFunctionsProvider>
            </TestQueryClientProvider>
          )
        }
      )
    }
  })
})
