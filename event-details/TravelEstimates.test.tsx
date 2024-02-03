import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useEventTravelEstimates } from "./TravelEstimates"
import { mockEventLocation } from "@event-details/MockData"
import { EventLocation } from "@shared-models/Event"
import {
  mockExpoLocationObject,
  mockLocationCoordinate2D
} from "@location/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import { setPlatform } from "@test-helpers/Platform"

describe("EventTravelEstimates tests", () => {
  describe("UseEventTravelEstimates tests", () => {
    const queryClient = createTestQueryClient()
    afterEach(() => act(() => jest.runAllTimers()))
    fakeTimers()
    beforeEach(() => {
      jest.resetAllMocks()
      queryClient.clear()
    })

    const loadTravelEstimates = jest.fn()
    const loadUserLocation = jest.fn()

    const TEST_LOCATION = mockEventLocation()
    const TEST_TRAVEL_ESTIMATES = {
      sourceCoordinate: mockLocationCoordinate2D(),
      any: null,
      automobile: null,
      walking: {
        travelDistanceMeters: 142,
        estimatedTravelSeconds: 69
      },
      publicTransport: {
        travelDistanceMeters: 2634,
        estimatedTravelSeconds: 420
      }
    }

    const renderUseEventTravelEstimates = (location: EventLocation) => {
      return renderHook(
        () => useEventTravelEstimates(location, loadTravelEstimates),
        {
          wrapper: ({ children }) => (
            <UserLocationFunctionsProvider
              getCurrentLocation={loadUserLocation}
              requestBackgroundPermissions={jest.fn()}
              requestForegroundPermissions={jest.fn()}
            >
              <TestQueryClientProvider client={queryClient}>
                {children}
              </TestQueryClientProvider>
            </UserLocationFunctionsProvider>
          )
        }
      )
    }

    describe("useCalculateETA tests", () => {
      test("should fetch data from a source and present travel estimates with user's current location", async () => {
        const userLocation = mockExpoLocationObject()
        loadUserLocation.mockResolvedValueOnce(userLocation)
        loadTravelEstimates.mockResolvedValueOnce(TEST_TRAVEL_ESTIMATES)
        const { result } = renderUseEventTravelEstimates(TEST_LOCATION)
        expect(result.current.status).toEqual("loading")
        await waitFor(() => {
          expect(result.current).toMatchObject({
            status: "success",
            data: TEST_TRAVEL_ESTIMATES
          })
        })
        expect(loadTravelEstimates).toHaveBeenCalledWith(
          TEST_LOCATION,
          userLocation.coords,
          expect.any(AbortSignal)
        )
        expect(loadTravelEstimates).toHaveBeenCalledTimes(1)
      })

      it("should be in an error state when loading the user location fails", async () => {
        loadUserLocation.mockRejectedValueOnce(new Error())
        const { result } = renderUseEventTravelEstimates(TEST_LOCATION)
        expect(result.current.status).toEqual("loading")
        await waitFor(() => expect(result.current.status).toEqual("error"))
        expect(loadTravelEstimates).not.toHaveBeenCalled()
      })

      it("should return an unsupported status when the platform is android", async () => {
        setPlatform("android")
        const { result } = renderUseEventTravelEstimates(TEST_LOCATION)
        expect(result.current.status).toEqual("unsupported")
        expect(loadTravelEstimates).not.toHaveBeenCalled()
        expect(loadUserLocation).not.toHaveBeenCalled()
      })
    })
  })
})
