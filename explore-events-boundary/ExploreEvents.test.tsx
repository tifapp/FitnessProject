import { EventMocks } from "@event-details-boundary/MockData"
import { renderUseLoadEventDetails } from "@event-details-boundary/TestHelpers"
import {
  mockExpoLocationObject,
  mockLocationCoordinate2D,
  mockRegion
} from "@location/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { neverPromise } from "@test-helpers/Promise"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { fakeTimers, timeTravel } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TiFAPI } from "TiFShared/api"
import { EventsInAreaResponse } from "TiFShared/api/models/Event"
import { EventID } from "TiFShared/domain-models/Event"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { UserHandle } from "TiFShared/domain-models/User"
import { mockTiFServer } from "TiFShared/test-helpers/mockAPIServer"
import { eventsByRegion, useExploreEvents } from "./ExploreEvents"
import { ExploreEventsInitialCenter } from "./InitialCenter"
import {
  ExploreEventsRegion,
  XEROX_ALTO_DEFAULT_REGION,
  createDefaultMapRegion
} from "./Region"
import { LiveEventsFeature, LiveEventsStore } from "@event/LiveEvents"
import { AlphaUserMocks } from "@user/alpha/MockData"

const TEST_EVENTS = [EventMocks.Multiday, EventMocks.PickupBasketball]

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("EventsByRegion tests", () => {
    fakeTimers()

    const TEST_EXPLORE_RESPONSE = {
      events: [
        {
          attendeeCount: 2,
          isChatExpired: false,
          createdDateTime: new Date("2024-03-25T03:31:24.000Z"),
          description: "Dactylomys boliviensis",
          endedDateTime: undefined,
          hasArrived: false,
          host: {
            handle: UserHandle.optionalParse("marygoodwin3187")!,
            id: "269851f0-64ae-4fc6-a2e3-e1b957cc7769",
            relationStatus: "friends" as const,
            name: "Mary Goodwin"
          },
          id: 19160,
          joinedDateTime: new Date("2024-03-25T03:31:26.000Z"),
          location: {
            arrivalRadiusMeters: 120,
            coordinate: {
              latitude: 34.9187,
              longitude: -94.8593
            },
            isInArrivalTrackingPeriod: true,
            placemark: {
              city: "Sample Neighborhood",
              country: "Sample Country",
              name: "Sample Location",
              street: "Sample Street",
              streetNumber: "1234"
            },
            timezoneIdentifier: "Sample/Timezone"
          },
          previewAttendees: [
            {
              id: "269851f0-64ae-4fc6-a2e3-e1b957cc7769",
              handle: UserHandle.optionalParse("marygoodwin3187")!,
              hasArrived: false,
              joinedDateTime: new Date("2024-03-25T07:54:28.000Z"),
              role: "hosting" as const,
              relationStatus: "friends" as const,
              name: "Mary Goodwin"
            },
            {
              id: "b144faae-8519-40ab-9af4-99a27bf7bccd",
              name: "Bitchell Dickle",
              handle: UserHandle.optionalParse("bitchell_dickle")!,
              hasArrived: false,
              joinedDateTime: new Date("2024-03-25T07:56:28.000Z"),
              role: "attending" as const,
              relationStatus: "not-friends" as const
            }
          ],
          settings: {
            isChatEnabled: true,
            shouldHideAfterStartDate: true
          },
          time: {
            dateRange: dateRange(
              new Date("2024-03-25T15:31:22.000Z"),
              new Date("2025-03-25T03:31:22.000Z")
            )!,
            secondsToStart: 43195.08,
            todayOrTomorrow: "today" as const
          },
          title: "quince",
          updatedDateTime: new Date("2024-03-25T03:31:24.000Z"),
          userAttendeeStatus: "attending" as const
        },
        {
          attendeeCount: 2,
          isChatExpired: false,
          createdDateTime: new Date("2024-03-25T03:31:24.000Z"),
          description: "Dactylomys boliviensis",
          endedDateTime: undefined,
          hasArrived: false,
          host: {
            handle: UserHandle.optionalParse("marygoodwin3187")!,
            id: "269851f0-64ae-4fc6-a2e3-e1b957cc7769",
            relationStatus: "friends" as const,
            name: "Mary Goodwin"
          },
          id: 19161,
          joinedDateTime: new Date("2024-03-25T03:31:26.000Z"),
          location: {
            arrivalRadiusMeters: 120,
            coordinate: {
              latitude: 34.9187,
              longitude: -94.8593
            },
            isInArrivalTrackingPeriod: true,
            placemark: {
              city: "Sample Neighborhood",
              country: "Sample Country",
              name: "Sample Location",
              street: "Sample Street",
              streetNumber: "1234"
            },
            timezoneIdentifier: "Sample/Timezone"
          },
          previewAttendees: [
            {
              id: "269851f0-64ae-4fc6-a2e3-e1b957cc7769",
              handle: UserHandle.optionalParse("marygoodwin3187")!,
              hasArrived: false,
              joinedDateTime: new Date("2024-03-25T07:54:28.000Z"),
              role: "hosting" as const,
              relationStatus: "friends" as const,
              name: "Mary Goodwin"
            },
            {
              id: "b144faae-8519-40ab-9af4-99a27bf7bccd",
              name: "Bitchell Dickle",
              handle: UserHandle.optionalParse("bitchell_dickle")!,
              hasArrived: false,
              joinedDateTime: new Date("2024-03-25T07:56:28.000Z"),
              role: "attending" as const,
              relationStatus: "not-friends" as const
            }
          ],
          settings: {
            isChatEnabled: true,
            shouldHideAfterStartDate: true
          },
          time: {
            dateRange: dateRange(
              new Date("2024-03-24T15:31:22.000Z"),
              new Date("2025-03-25T03:31:22.000Z")
            )!,
            secondsToStart: -43204.922
          },
          title: "quince",
          updatedDateTime: new Date("2024-03-25T03:31:24.000Z"),
          userAttendeeStatus: "attending" as const
        }
      ]
    }

    test("basics", async () => {
      const now = new Date()
      jest.setSystemTime(now)
      const region = {
        latitude: 88.1,
        longitude: 44.1,
        latitudeDelta: 0.4,
        longitudeDelta: 0.3
      }
      setupExploreEndpointHandlerExpectingRegion(
        region.latitude,
        region.longitude,
        66716.955
      )
      const events = await eventsByRegion(
        region,
        undefined,
        TiFAPI.testAuthenticatedInstance
      )
      expect(events).toMatchObject([
        {
          id: TEST_EXPLORE_RESPONSE.events[0].id,
          time: { clientReceivedTime: now }
        },
        {
          id: TEST_EXPLORE_RESPONSE.events[1].id,
          time: { clientReceivedTime: now }
        }
      ])
    })

    const setupExploreEndpointHandlerExpectingRegion = (
      latitude: number,
      longitude: number,
      radius: number
    ) => {
      mockTiFServer({
        exploreEvents: {
          expectedRequest: {
            body: {
              userLocation: { latitude, longitude },
              radius: expect.closeTo(radius)
            }
          },
          mockResponse: {
            status: 200,
            data: TEST_EXPLORE_RESPONSE as unknown as EventsInAreaResponse
          }
        }
      })
    }
  })

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

      await waitFor(() => expect(result.current.data.status).toEqual("pending"))

      await waitFor(() => expect(result.current.region).toEqual(expectedRegion))

      await waitFor(() => expect(result.current.data.status).toEqual("success"))
      expect(result.current.data.events).toEqual(TEST_EVENTS)
      expectFetchedExploreRegion(expectedRegion)
    })

    it("should place ongoing events in a separate field", async () => {
      const userLocation = mockExpoLocationObject()
      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockReturnValueOnce(userLocation)
      fetchEvents.mockResolvedValueOnce(TEST_EVENTS)

      const store = new LiveEventsStore(
        queryClient,
        jest.fn().mockResolvedValueOnce({
          ongoing: [TEST_EVENTS[1]],
          startingSoon: []
        })
      )
      store.beginObserving(AlphaUserMocks.TheDarkLord.id)

      const { result } = renderUseExploreEvents(
        { center: "user-location" },
        store
      )

      await waitFor(() => expect(result.current.data.status).toEqual("success"))
      expect(result.current.data.events).toEqual([TEST_EVENTS[0]])
      expect(result.current.ongoingEvents).toEqual([TEST_EVENTS[1]])
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

    it("should use the Xerox Alto as the default region when user denies foreground location permissions", async () => {
      mockEndlessFetchEvents()
      requestForegroundPermissions.mockResolvedValueOnce({ granted: false })
      queryUserCoordinates.mockRejectedValueOnce(new Error())

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expectFetchedExploreRegion(XEROX_ALTO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(XEROX_ALTO_DEFAULT_REGION)
    })

    it("should use Xerox Alto as the default region when user location fetch errors", async () => {
      mockEndlessFetchEvents()
      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockRejectedValueOnce(new Error())

      const { result } = renderUseExploreEvents({ center: "user-location" })

      await waitFor(() => {
        expectFetchedExploreRegion(XEROX_ALTO_DEFAULT_REGION)
      })
      expect(result.current.region).toEqual(XEROX_ALTO_DEFAULT_REGION)
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
      requestForegroundPermissions.mockResolvedValueOnce({ granted: true })
      queryUserCoordinates.mockRejectedValueOnce(new Error())

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

    const expectFetchedExploreRegion = (region: ExploreEventsRegion) => {
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

    const renderUseExploreEvents = (
      center: ExploreEventsInitialCenter,
      store: LiveEventsStore = new LiveEventsStore(queryClient, jest.fn())
    ) => {
      return renderHook(
        () =>
          useExploreEvents(center, {
            fetchEvents,
            isSignificantlyDifferentRegions
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider client={queryClient}>
              <LiveEventsFeature.Provider store={store}>
                <UserLocationFunctionsProvider
                  getCurrentLocation={queryUserCoordinates}
                  requestForegroundPermissions={requestForegroundPermissions}
                >
                  {children}
                </UserLocationFunctionsProvider>
              </LiveEventsFeature.Provider>
            </TestQueryClientProvider>
          )
        }
      )
    }
  })
})
