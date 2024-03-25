import { EventMocks } from "@event-details/MockData"
import {
  mockExpoLocationObject,
  mockLocationCoordinate2D,
  mockRegion
} from "@location/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { timeTravel, fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  createDefaultMapRegion,
  SAN_FRANCISCO_DEFAULT_REGION,
  ExploreEventsInitialCenter
} from "./Models"
import { useExploreEvents } from "./ExploreEvents"
import { renderUseLoadEventDetails } from "@event-details/TestHelpers"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { neverPromise } from "@test-helpers/Promise"
import { EventID } from "@shared-models/Event"
import { Region } from "@location/Region"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

const TEST_EVENTS = [EventMocks.Multiday, EventMocks.PickupBasketball]

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("UseExploreEvents tests", () => {
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
      fetchEvents.mockResolvedValueOnce(TEST_EVENTS)

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => expect(result.current.data.status).toEqual("loading"))

      await waitFor(() => expect(result.current.region).toEqual(expectedRegion))

      await waitFor(() => expect(result.current.data.status).toEqual("success"))
      expect(result.current.data.events).toEqual(TEST_EVENTS)
      expectFetchedExploreRegion(expectedRegion)
    })

    test("retrying after unsuccessfully exploring events", async () => {
      fetchEvents
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce([EventMocks.Multiday])

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
      fetchEvents.mockResolvedValueOnce([])
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
      mockEndlessFetchEvents()
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
        expectFetchedExploreRegion(expectedRegion)
      })
    })

    it("should not request location permissions if initial coordinates provided", async () => {
      mockEndlessFetchEvents()

      renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => {
        expect(requestForegroundPermissions).not.toHaveBeenCalled()
      })
    })

    it("should use sanfrancisco as the default region when user denies foreground location permissions", async () => {
      mockEndlessFetchEvents()
      requestForegroundPermissions.mockResolvedValueOnce({ granted: false })

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expectFetchedExploreRegion(SAN_FRANCISCO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(SAN_FRANCISCO_DEFAULT_REGION)
    })

    it("should use sanfrancisco as the default region when user location fetch errors", async () => {
      mockEndlessFetchEvents()
      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockRejectedValueOnce(new Error())

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expectFetchedExploreRegion(SAN_FRANCISCO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(SAN_FRANCISCO_DEFAULT_REGION)
    })

    it("should maintain current region when new region is not significantly different", async () => {
      mockEndlessFetchEvents()
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
      await verifyNeverOccurs(() => {
        expectFetchedExploreRegion(updatedRegion)
      })
    })

    it("should update to new region after debounce period if new region is significantly different", async () => {
      mockEndlessFetchEvents()
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
        expectFetchedExploreRegion(updatedRegion)
      })
    })

    it("should region update region immediately when current region is non-existent", async () => {
      mockEndlessFetchEvents()
      const { result } = renderUseExploreEvents({ center: "user-location" })

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      expect(result.current.region).toMatchObject(region)
      await waitFor(() => {
        expectFetchedExploreRegion(region)
      })
    })

    it("should cancel the existing fetch immediatedly when significant region change", async () => {
      let testSignal: AbortSignal | undefined
      fetchEvents.mockImplementation(async (_, signal) => {
        testSignal = signal
        return await neverPromise()
      })
      isSignificantlyDifferentRegions.mockReturnValueOnce(true)

      const { result } = renderUseExploreEvents({
        center: "preset",
        coordinate: mockLocationCoordinate2D()
      })

      await waitFor(() => expect(fetchEvents).toHaveBeenCalled())

      const region = mockRegion()
      act(() => result.current.updateRegion(region))

      await waitFor(() => expect(testSignal?.aborted).toEqual(true))
    })

    it("should seed the query cache with an entry for each individual loaded event", async () => {
      const events = [EventMocks.Multiday, EventMocks.PickupBasketball]
      fetchEvents.mockResolvedValueOnce(events)

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

    const expectFetchedExploreRegion = (region: Region) => {
      expect(fetchEvents).toHaveBeenCalledWith(region, expect.any(AbortSignal))
    }

    const renderEventDetails = (id: EventID) => {
      return renderUseLoadEventDetails(
        id,
        new TestInternetConnectionStatus(true),
        neverPromise,
        queryClient
      )
    }

    const mockEndlessFetchEvents = () => {
      fetchEvents.mockImplementationOnce(neverPromise)
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
