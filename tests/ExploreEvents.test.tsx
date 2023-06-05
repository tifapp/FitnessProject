import {
  LocationCoordinate2D,
  mockLocationCoordinate2D,
  mockTrackedLocationCoordinate
} from "@lib/location"
import { useExploreEvents } from "@screens/ExploreEvents"
import { renderHook, waitFor } from "@testing-library/react-native"
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

    const queryUserCoordinates = jest.fn()

    const fetchEvents = jest.fn()

    const renderUseExploreEvents = (center?: LocationCoordinate2D) => {
      return renderHook(() => useExploreEvents(center, { fetchEvents }), {
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
      })
    }
  })
})
