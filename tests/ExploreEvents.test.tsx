import {
  LocationCoordinate2D,
  mockTrackedLocationCoordinate
} from "@lib/location"
import {
  exploreEventsFetchUserLocation,
  useExploreEvents
} from "@screens/ExploreEvents"
import { act, render, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { neverPromise } from "./helpers/Promise"

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

    const onUserLocationPermissionDenied = jest.fn()
    const fetchUserLocation = jest.fn()

    const renderUseExploreEvents = (center?: LocationCoordinate2D) => {
      return renderHook(
        () => {
          return useExploreEvents({
            center,
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
