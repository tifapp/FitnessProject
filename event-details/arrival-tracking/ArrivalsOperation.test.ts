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

describe("ArrivalsOperation tests", () => {
  describe("PerformEventArrivalsOperation tests", () => {
    const TEST_ARRIVALS_LOCATION = {
      coordinate: mockLocationCoordinate2D(),
      eventIds: [1, 2, 3, 4]
    }

    const EXPECTED_ARRIVALS_RESULTS = [
      { eventId: 1, status: "success" },
      { eventId: 2, status: "success" },
      { eventId: 3, status: "remove-from-tracking" },
      {
        eventId: 4,
        status: "outdated-coordinate",
        updatedCoordinate: mockLocationCoordinate2D()
      }
    ]

    const testBodyHandler = async (
      req: RestRequest<DefaultBodyType, PathParams<string>>,
      res: ResponseComposition<DefaultBodyType>,
      ctx: RestContext
    ) => {
      expect(await req.json()).toEqual({
        location: TEST_ARRIVALS_LOCATION.coordinate,
        events: TEST_ARRIVALS_LOCATION.eventIds
      })
      return res(
        ctx.status(200),
        ctx.json({
          arrivalStatuses: EXPECTED_ARRIVALS_RESULTS
        })
      )
    }

    test("arrived", async () => {
      mswServer.use(
        rest.post(TiFAPI.testPath("/events/arrived"), testBodyHandler)
      )
      const results = await performEventArrivalsOperation(
        TEST_ARRIVALS_LOCATION,
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
        TEST_ARRIVALS_LOCATION,
        "departed",
        TiFAPI.testAuthenticatedInstance
      )
      expect(results).toMatchObject(EXPECTED_ARRIVALS_RESULTS)
    })
  })
})
