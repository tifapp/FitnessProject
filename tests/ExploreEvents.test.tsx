import { mockTrackedLocationCoordinate } from "@lib/location"
import {
  exploreEventsFetchUserLocation,
  useExploreEvents
} from "@screens/ExploreEvents"
import { act, render, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"

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

      await waitFor(() =>
        expect(onUserLocationPermissionDenied).not.toHaveBeenCalled()
      )
    })

    const onUserLocationPermissionDenied = jest.fn()
    const fetchUserLocation = jest.fn()

    const renderUseExploreEvents = () => {
      return renderHook(
        () => {
          return useExploreEvents({
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
