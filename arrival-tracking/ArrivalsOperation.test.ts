import { TiFAPI } from "TiFShared/api"
import { randomFloatInRange } from "@lib/utils/Random"
import { mockLocationCoordinate2D } from "@location/MockData"
import { mswServer } from "@test-helpers/msw"
import { DefaultBodyType, HttpResponse, StrictRequest, http } from "msw"
import { performEventArrivalsOperation } from "./ArrivalsOperation"
import { mockEventArrivalRegion } from "./MockData"
import { repeatElements } from "TiFShared/lib/Array"
import { EventArrivals } from "./Arrivals"

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

    const testBodyHandler = async ({
      request
    }: {
      request: StrictRequest<DefaultBodyType>
    }) => {
      expect(await request.json()).toEqual(TEST_REGION)
      return HttpResponse.json({ trackableRegions: EXPECTED_ARRIVAL_REGIONS })
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
      expect(results).toEqual(EXPECTED_ARRIVALS)
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
      expect(results).toEqual(EXPECTED_ARRIVALS)
    })
  })
})
