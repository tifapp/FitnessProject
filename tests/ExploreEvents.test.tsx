import { mockLocationCoordinate2D } from "@lib/location"
import { useExploreEvents } from "@screens/ExploreEvents"
import { renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"
import { act } from "react-test-renderer"
import { neverPromise } from "./helpers/Promise"

describe("ExploreEvents tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useExploreEvents tests", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("should be in a loading state when fetching events", async () => {
      fetchEvents.mockImplementation(neverPromise)
      const { result } = renderUseExploreEvents()
      expect(result.current.events).toMatchObject({ status: "idle" })

      const coordinates = mockLocationCoordinate2D()
      act(() => result.current.regionUpdated(coordinates))

      await waitFor(() => {
        expect(result.current.events).toMatchObject({
          status: "loading"
        })
      })
    })

    const fetchEvents = jest.fn()

    const renderUseExploreEvents = () => {
      return renderHook(() => useExploreEvents(fetchEvents), {
        wrapper: ({ children }) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      })
    }
  })
})
