import { LocationCoordinate2D, mockLocationCoordinate2D } from "@lib/location"
import { useExploreEvents } from "@screens/ExploreEvents"
import { renderHook } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { neverPromise } from "./helpers/Promise"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should be in a loading state when fetching events", async () => {
      fetchEvents.mockImplementation(neverPromise)
      const coordinates = mockLocationCoordinate2D()
      const { result } = renderUseExploreEvents(coordinates)
      expect(result.current.events).toMatchObject({ status: "loading" })
    })

    const fetchEvents = jest.fn()

    const renderUseExploreEvents = (center?: LocationCoordinate2D) => {
      return renderHook(() => useExploreEvents(center, { fetchEvents }), {
        wrapper: ({ children }) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      })
    }
  })
})
