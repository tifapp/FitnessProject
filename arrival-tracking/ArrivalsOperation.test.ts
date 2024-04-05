import { TiFAPI } from "@api-client/TiFAPI"
import { randomFloatInRange } from "@lib/utils/Random"
import { mockLocationCoordinate2D } from "@location/MockData"
import { mswServer } from "@test-helpers/msw"
import { DefaultBodyType, HttpResponse, StrictRequest, http } from "msw"
import { performEventArrivalsOperation } from "./ArrivalsOperation"
import { mockEventArrivalRegion } from "./MockData"
import { repeatElements } from "TiFShared/lib/Array"

describe("ArrivalsOperation tests", () => {
  describe("PerformEventArrivalsOperation tests", () => {
    const TEST_REGION = {
      coordinate: mockLocationCoordinate2D(),
      arrivalRadiusMeters: randomFloatInRange(50, 150)
    }

    const EXPECTED_ARRIVALS_RESULTS = repeatElements(4, () => {
      return mockEventArrivalRegion()
    })

    const testBodyHandler = async ({
      request
    }: {
      request: StrictRequest<DefaultBodyType>
    }) => {
      expect(await request.json()).toEqual(TEST_REGION)

      return new HttpResponse(
        JSON.stringify({ upcomingRegions: EXPECTED_ARRIVALS_RESULTS }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }

    test("arrived", async () => {
      mswServer.use(
        http.post(TiFAPI.testPath("/event/arrived"), testBodyHandler)
      )
      const results = await performEventArrivalsOperation(
        TEST_REGION,
        "arrived",
        TiFAPI.testAuthenticatedInstance
      )
      expect(results).toMatchObject(EXPECTED_ARRIVALS_RESULTS)
    })

    test("departed", async () => {
      mswServer.use(
        http.post(TiFAPI.testPath("/event/departed"), testBodyHandler)
      )
      const results = await performEventArrivalsOperation(
        TEST_REGION,
        "departed",
        TiFAPI.testAuthenticatedInstance
      )
      expect(results).toMatchObject(EXPECTED_ARRIVALS_RESULTS)
    })
  })
})
