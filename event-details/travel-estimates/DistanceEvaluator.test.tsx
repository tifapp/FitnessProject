import { LocationCoordinate2D } from "@shared-models/Location"
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
      () => useCalculateETA(eventLocation, loadETAFromLocations),
      {
        wrapper: ({ children }) => (
          <TestQueryClientProvider client={queryClient}>
            {children}
          </TestQueryClientProvider>
        )
      }
    )
  }

  const exampleEstimateResponse = async (
    rootLocation: LocationCoordinate2D
  ): Promise<TravelEstimates> => {
    return {
      userLocation: {
        coords: {
          latitude: rootLocation.latitude,
          longitude: rootLocation.longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: 0
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
        userLocation: {
          coords: {
            latitude: testLocation.latitude,
            longitude: testLocation.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: 0
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
    test("should fetch data from query cache correctly", async () => {
      const testLocation = mockLocationCoordinate2D()
      loadETAFromLocations.mockResolvedValueOnce(
        exampleEstimateResponse(testLocation)
      )
      renderUseCalculateETA(testLocation)
      const mockResult = {
        userLocation: {
          coords: {
            latitude: testLocation.latitude,
            longitude: testLocation.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: 0
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
        expect(
          queryClient.getQueryData([
            "user-coordinates",
            mockResult.userLocation.coords
          ])
        ).toMatchObject(mockResult)
      })
    })
  })
})
