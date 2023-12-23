import { TiFAPI } from "@api-client/TiFAPI"
import { mockLocationCoordinate2D } from "@location/MockData"
import { mswServer } from "@test-helpers/msw"
import {
  DefaultBodyType,
  PathParams,
  ResponseComposition,
  RestContext,
  RestRequest,
  rest
} from "msw"
import { performEventArrivalsOperation } from "./ArrivalsOperation"
import { randomFloatInRange } from "@lib/utils/Random"
import { ArrayUtils } from "@lib/utils/Array"
import { mockEventArrivalRegion } from "./MockData"

describe("ArrivalsOperation tests", () => {
  describe("PerformEventArrivalsOperation tests", () => {
    const TEST_REGION = {
      coordinate: mockLocationCoordinate2D(),
      arrivalRadiusMeters: randomFloatInRange(50, 150)
    }

    const EXPECTED_ARRIVALS_RESULTS = ArrayUtils.repeatElements(4, () => {
      return mockEventArrivalRegion()
    })

    const testBodyHandler = async (
      req: RestRequest<DefaultBodyType, PathParams<string>>,
      res: ResponseComposition<DefaultBodyType>,
      ctx: RestContext
    ) => {
      expect(await req.json()).toEqual(TEST_REGION)
      return res(
        ctx.status(200),
        ctx.json({
          upcomingRegions: EXPECTED_ARRIVALS_RESULTS
        })
      )
    }

    test("arrived", async () => {
      mswServer.use(
        rest.post(TiFAPI.testPath("/events/arrived"), testBodyHandler)
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
        rest.post(TiFAPI.testPath("/events/departed"), testBodyHandler)
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
