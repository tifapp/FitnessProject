import { randomFloatInRange } from "@lib/utils/Random"
import { mockLocationCoordinate2D } from "@location/MockData"
import { TiFAPI } from "TiFShared/api"
import { repeatElements } from "TiFShared/lib/Array"
import { mockTiFServer } from "TiFShared/test-helpers/mockAPIServer"
import { EventArrivals } from "./Arrivals"
import { performEventArrivalsOperation } from "./ArrivalsOperation"
import { mockEventArrivalRegion } from "./MockData"

describe("ArrivalsOperation tests", () => {
  describe("PerformEventArrivalsOperation tests", () => {
    const TEST_REGION = {
      coordinate: mockLocationCoordinate2D(),
      arrivalRadiusMeters: randomFloatInRange(50, 150)
    }

    const EXPECTED_ARRIVAL_REGIONS = repeatElements(4, () => {
      return mockEventArrivalRegion()
    })

    const EXPECTED_ARRIVALS = EventArrivals.fromRegions(
      EXPECTED_ARRIVAL_REGIONS
    )

    const mockAPI = (endpoint: "departFromRegion" | "arriveAtRegion") =>
      mockTiFServer({
        [endpoint]: {
          expectedRequest: { body: TEST_REGION },
          mockResponse: {
            status: 200,
            data: { trackableRegions: EXPECTED_ARRIVAL_REGIONS }
          }
        }
      })

    test("arrived", async () => {
      mockAPI("arriveAtRegion")

      const results = await performEventArrivalsOperation(
        TEST_REGION,
        "arrived",
        TiFAPI.testAuthenticatedInstance
      )
      expect(results).toEqual(EXPECTED_ARRIVALS)
    })

    test("departed", async () => {
      mockAPI("departFromRegion")

      const results = await performEventArrivalsOperation(
        TEST_REGION,
        "departed",
        TiFAPI.testAuthenticatedInstance
      )
      expect(results).toEqual(EXPECTED_ARRIVALS)
    })
  })
})
