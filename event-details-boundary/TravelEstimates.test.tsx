import { EXPO_LOCATION_ERRORS } from "@location/Expo"
import {
  mockExpoLocationObject,
  mockLocationCoordinate2D
} from "@location/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import { setPlatform } from "@test-helpers/Platform"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { renderHook, waitFor } from "@testing-library/react-native"
import { CodedError } from "expo-modules-core"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { dayjs } from "TiFShared/lib/Dayjs"
import {
  EventTravelEstimatesFeature,
  formattedTravelEstimateResult,
  useEventTravelEstimates
} from "./TravelEstimates"

describe("EventTravelEstimates tests", () => {
  describe("UseEventTravelEstimates tests", () => {
    beforeEach(() => jest.resetAllMocks())

    const loadTravelEstimates = jest.fn()
    const loadUserLocation = jest.fn()

    const TEST_COORDINATE = mockLocationCoordinate2D()
    const TEST_TRAVEL_ESTIMATES = {
      automobile: null,
      walking: {
        travelDistanceMeters: 142,
        expectedTravelSeconds: 69
      },
      publicTransportation: {
        travelDistanceMeters: 2634,
        expectedTravelSeconds: 420
      }
    }

    const renderUseEventTravelEstimates = (
      coordinate: LocationCoordinate2D
    ) => {
      return renderHook(() => useEventTravelEstimates(coordinate), {
        wrapper: ({ children }) => (
          <UserLocationFunctionsProvider getCurrentLocation={loadUserLocation}>
            <EventTravelEstimatesFeature.Provider
              eventTravelEstimates={loadTravelEstimates}
            >
              <TestQueryClientProvider>{children}</TestQueryClientProvider>
            </EventTravelEstimatesFeature.Provider>
          </UserLocationFunctionsProvider>
        )
      })
    }

    afterEach(() => setPlatform("ios"))

    test("should fetch data from a source and present travel estimates with user's current location", async () => {
      const userLocation = mockExpoLocationObject()
      loadUserLocation.mockResolvedValueOnce(userLocation)
      loadTravelEstimates.mockResolvedValueOnce(TEST_TRAVEL_ESTIMATES)
      const { result } = renderUseEventTravelEstimates(TEST_COORDINATE)
      expect(result.current.status).toEqual("pending")
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "success",
          data: TEST_TRAVEL_ESTIMATES
        })
      })
      expect(loadTravelEstimates).toHaveBeenCalledWith(
        userLocation.coords,
        TEST_COORDINATE,
        expect.any(AbortSignal)
      )
      expect(loadTravelEstimates).toHaveBeenCalledTimes(1)
    })

    it("should be in an error state when loading the user location fails", async () => {
      loadUserLocation.mockRejectedValueOnce(new Error())
      const { result } = renderUseEventTravelEstimates(TEST_COORDINATE)
      expect(result.current.status).toEqual("pending")
      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect(loadTravelEstimates).not.toHaveBeenCalled()
    })

    it("should return an unsupported status when the platform is android", async () => {
      setPlatform("android")
      const { result } = renderUseEventTravelEstimates(TEST_COORDINATE)
      expect(result.current.status).toEqual("unsupported")
      expect(loadTravelEstimates).not.toHaveBeenCalled()
      expect(loadUserLocation).not.toHaveBeenCalled()
    })

    it("should return not-permissible when location permissions are disabled", async () => {
      loadUserLocation.mockRejectedValueOnce(
        new CodedError(EXPO_LOCATION_ERRORS.noPermissions, "")
      )
      const { result } = renderUseEventTravelEstimates(TEST_COORDINATE)
      expect(result.current.status).toEqual("pending")
      await waitFor(() => {
        expect(result.current.status).toEqual("not-permissible")
      })
      expect(loadTravelEstimates).not.toHaveBeenCalled()
    })

    it("should return disabled when location services are disabled", async () => {
      loadUserLocation.mockRejectedValueOnce(
        new CodedError(EXPO_LOCATION_ERRORS.servicesDisabled, "")
      )
      const { result } = renderUseEventTravelEstimates(TEST_COORDINATE)
      expect(result.current.status).toEqual("pending")
      await waitFor(() => {
        expect(result.current.status).toEqual("disabled")
      })
      expect(loadTravelEstimates).not.toHaveBeenCalled()
    })
  })

  describe("FormattedTravelEstimateResult tests", () => {
    const testSuccess = {
      status: "success",
      data: {
        automobile: {
          travelDistanceMeters: 1600,
          expectedTravelSeconds: 330
        },
        walking: {
          travelDistanceMeters: 100,
          expectedTravelSeconds: 4200
        },
        publicTransportation: null
      }
    } as const

    const testSuccess2 = {
      status: "success",
      data: {
        automobile: {
          travelDistanceMeters: 1800,
          expectedTravelSeconds: 50
        },
        walking: {
          travelDistanceMeters: 400,
          expectedTravelSeconds: 3600
        },
        publicTransportation: {
          travelDistanceMeters: 400,
          expectedTravelSeconds: dayjs.duration(1.1, "days").asSeconds()
        }
      }
    } as const

    const testSuccess3 = {
      status: "success",
      data: {
        automobile: {
          travelDistanceMeters: 1800,
          expectedTravelSeconds: dayjs.duration(1, "day").asSeconds()
        },
        walking: {
          travelDistanceMeters: 1800,
          expectedTravelSeconds: dayjs.duration(1.6, "day").asSeconds()
        },
        publicTransportation: {
          travelDistanceMeters: 1800,
          expectedTravelSeconds: dayjs.duration(1.6, "hour").asSeconds()
        }
      }
    } as const

    it("should return undefined when not a success status", () => {
      expect(
        formattedTravelEstimateResult({ status: "pending" }, "automobile")
      ).toBeUndefined()
      expect(
        formattedTravelEstimateResult({ status: "error" }, "automobile")
      ).toBeUndefined()
      expect(
        formattedTravelEstimateResult({ status: "unsupported" }, "automobile")
      ).toBeUndefined()
      expect(
        formattedTravelEstimateResult({ status: "disabled" }, "automobile")
      ).toBeUndefined()
      expect(
        formattedTravelEstimateResult(
          { status: "not-permissible" },
          "automobile"
        )
      ).toBeUndefined()
    })

    it("should return undefined when null estimate for the travel key", () => {
      expect(
        formattedTravelEstimateResult(testSuccess, "publicTransportation")
      ).toBeUndefined()
    })

    it("should return undefined when expectedTravelSeconds is less than a minute", () => {
      expect(
        formattedTravelEstimateResult(testSuccess2, "automobile")
      ).toBeUndefined()
    })

    it("should use feet for the travel distance when less than 0.1 miles in distance", () => {
      expect(
        formattedTravelEstimateResult(testSuccess, "walking")?.travelDistance
      ).toEqual("328 ft")
    })

    test("exactly 1 mile distance", () => {
      expect(
        formattedTravelEstimateResult(testSuccess, "automobile")?.travelDistance
      ).toEqual("1 mi")
    })

    test("decimal mile distance", () => {
      expect(
        formattedTravelEstimateResult(testSuccess3, "automobile")
          ?.travelDistance
      ).toEqual("1.1 mi")
    })

    test("exact time durations", () => {
      expect(
        formattedTravelEstimateResult(testSuccess2, "walking")?.travelTime
      ).toEqual("1h")
      expect(
        formattedTravelEstimateResult(testSuccess3, "automobile")?.travelTime
      ).toEqual("1d")
    })

    test("decimal time durations", () => {
      expect(
        formattedTravelEstimateResult(testSuccess, "automobile")?.travelTime
      ).toEqual("6 min")
      expect(
        formattedTravelEstimateResult(testSuccess, "walking")?.travelTime
      ).toEqual("1h 10m")
      expect(
        formattedTravelEstimateResult(testSuccess2, "publicTransportation")
          ?.travelTime
      ).toEqual("1d 2h")
      expect(
        formattedTravelEstimateResult(testSuccess3, "walking")?.travelTime
      ).toEqual("1d 14h")
      expect(
        formattedTravelEstimateResult(testSuccess3, "publicTransportation")
          ?.travelTime
      ).toEqual("1h 36m")
    })
  })
})
