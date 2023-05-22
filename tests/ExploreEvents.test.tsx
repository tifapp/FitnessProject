import {
  LocationCoordinate2D,
  mockLocationCoordinate2D,
  mockTrackedLocationCoordinate
} from "@lib/location"
import {
  exploreEventsFetchUserLocation,
  useExploreEvents
} from "@screens/ExploreEvents"
import { renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { EventMocks } from "@lib/events"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("exploreEventsFetchUserLocation tests", () => {
    it("returns a permissions denied status when location permission request is denied", async () => {
      expect(
        await exploreEventsFetchUserLocation(
          jest.fn().mockResolvedValue({ granted: false }),
          jest.fn()
        )
      ).toMatchObject({ status: "permission-denied" })
    })

    it("loads the user's location when location permission request is granted", async () => {
      const trackedCoordinate = mockTrackedLocationCoordinate()
      expect(
        await exploreEventsFetchUserLocation(
          jest.fn().mockResolvedValue({ granted: true }),
          jest.fn().mockResolvedValue(trackedCoordinate)
        )
      ).toMatchObject({ status: "success", location: trackedCoordinate })
    })
  })

  describe("useExploreEvents tests", () => {
    it("presents the location search when user location permissions denied", async () => {
      fetchUserLocation.mockResolvedValue({ status: "permission-denied" })
      renderUseExploreEvents()

      await waitFor(() => expect(fetchUserLocation).toHaveBeenCalled())
      expect(onUserLocationPermissionDenied).toHaveBeenCalled()
    })

    it("does not present location search when user location fetch successful", async () => {
      const location = mockTrackedLocationCoordinate()
      fetchUserLocation.mockResolvedValue({ status: "success", location })
      renderUseExploreEvents()

      await waitFor(() => {
        expect(onUserLocationPermissionDenied).not.toHaveBeenCalled()
      })
    })

    it("presents a user location error when location fetch fails and no preset center", async () => {
      fetchUserLocation.mockRejectedValue(new Error("The user died"))
      const { result } = renderUseExploreEvents()

      expect(result.current.data).toMatchObject({ status: "loading" })
      await waitFor(() => expect(fetchUserLocation).toHaveBeenCalled())
      expect(result.current.data).toMatchObject({
        status: "error",
        type: "user-location"
      })
    })

    it("does not fetch user location when initial center given", async () => {
      const center = mockLocationCoordinate2D()
      renderUseExploreEvents(center)
      await waitFor(() => expect(fetchUserLocation).not.toHaveBeenCalled())
    })

    it("fetches events with the initial given center", async () => {
      const center = mockLocationCoordinate2D()
      fetchEvents.mockResolvedValue([EventMocks.PickupBasketball])
      const { result } = renderUseExploreEvents(center)

      expect(result.current.data).toMatchObject({ status: "loading" })
      await waitFor(() => expect(fetchEvents).toHaveBeenCalledWith(center))
      expect(result.current.data).toMatchObject({
        status: "success",
        events: [EventMocks.PickupBasketball]
      })
    })

    it("fetches events with user location as center when no initial center given", async () => {
      const location = mockTrackedLocationCoordinate()
      fetchUserLocation.mockResolvedValue({ status: "success", location })
      fetchEvents.mockResolvedValue([EventMocks.PickupBasketball])
      const { result } = renderUseExploreEvents()

      expect(result.current.data).toMatchObject({ status: "loading" })
      await waitFor(() => expect(fetchUserLocation).toHaveBeenCalled())
      expect(fetchEvents).toHaveBeenCalledWith(location.coordinates)
      expect(result.current.data).toMatchObject({
        status: "success",
        events: [EventMocks.PickupBasketball]
      })
    })

    it("presents a no-results error when empty events array fetched", async () => {
      fetchEvents.mockResolvedValue([])
      const { result } = renderUseExploreEvents(mockLocationCoordinate2D())

      expect(result.current.data).toMatchObject({ status: "loading" })
      await waitFor(() => expect(fetchEvents).toHaveBeenCalled())
      expect(result.current.data).toMatchObject({
        status: "error",
        type: "no-results"
      })
    })

    it("presents an events-loading error when event loading fails", async () => {
      fetchEvents.mockRejectedValue(
        new Error("Our backend was destroyed by a meteor")
      )
      const { result } = renderUseExploreEvents(mockLocationCoordinate2D())

      expect(result.current.data).toMatchObject({ status: "loading" })
      await waitFor(() => expect(fetchEvents).toHaveBeenCalled())
      expect(result.current.data).toMatchObject({
        status: "error",
        type: "events-loading"
      })
    })

    const onUserLocationPermissionDenied = jest.fn()
    const fetchEvents = jest.fn()
    const fetchUserLocation = jest.fn()

    const renderUseExploreEvents = (center?: LocationCoordinate2D) => {
      return renderHook(
        () => {
          return useExploreEvents({
            center,
            fetchEvents,
            fetchUserLocation,
            onUserLocationPermissionDenied
          })
        },
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
