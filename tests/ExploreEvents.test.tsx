import { mockLocationCoordinate2D, mockRegion } from "@lib/location"
import {
  ExploreEventsInitialCenter,
  useExploreEvents
} from "@screens/ExploreEvents"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { neverPromise } from "./helpers/Promise"
import { emptyCancellable } from "@lib/Cancellable"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should use the initial provided region when fetching for first time", async () => {
      fetchEvents.mockReturnValue(emptyCancellable(neverPromise()))
      const coordinates = mockLocationCoordinate2D()
      renderUseExploreEvents({ type: "preset", coordinates })
      await waitFor(() => {
        expect(fetchEvents).toHaveBeenCalledWith(
          expect.objectContaining(coordinates)
        )
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
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })

  describe("ExploreEventsView tests", () => {})
})
