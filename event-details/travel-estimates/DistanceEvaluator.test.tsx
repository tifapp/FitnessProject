import { LocationCoordinate2D } from "@location/Location"
import { mockLocationCoordinate2D } from "@location/MockData"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TravelEstimates, useCalculateETA } from "./DistanceEvaluator"

describe("DistanceEvaluator tests", () => {
  const queryClient = createTestQueryClient()
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => {
    jest.resetAllMocks()
    queryClient.clear()
  })

  const loadETAFromLocations = jest.fn()

  const renderUseCalculateETA = (eventLocation: LocationCoordinate2D) => {
    return renderHook(
      () => useCalculateETA(queryClient, eventLocation, loadETAFromLocations),
      {
        wrapper: ({ children }) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      }
    )
  }

  const exampleEstimateResponse = async (
    rootLocation: LocationCoordinate2D
  ): Promise<TravelEstimates> => {
    return {
      sourceLocation: {
        latitude: rootLocation.latitude,
        longitude: rootLocation.longitude
      },
      walking: {
        localizedWarnings: ["Godzilla is approaching the generator"],
        totalSecondsFromSource: 69
      },
      publicTransport: {
        localizedWarnings: [],
        totalSecondsFromSource: 420
      }
    }
  }

  describe("useCalculateETA tests", () => {
    test("should fetch data from a source and present ETA", async () => {
      const testLocation = mockLocationCoordinate2D()
      loadETAFromLocations.mockResolvedValueOnce(
        exampleEstimateResponse(testLocation)
      )
      const { result } = renderUseCalculateETA(testLocation)
      const mockResult = {
        sourceLocation: {
          latitude: testLocation.latitude,
          longitude: testLocation.longitude
        },
        walking: {
          localizedWarnings: ["Godzilla is approaching the generator"],
          totalSecondsFromSource: 69
        },
        publicTransport: {
          localizedWarnings: [],
          totalSecondsFromSource: 420
        }
      }
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "success",
          data: mockResult
        })
      })
    })
  })
})
