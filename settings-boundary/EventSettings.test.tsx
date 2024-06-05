import { EventMocks } from "@event-details-boundary/MockData"

describe("Event Settings tests", () => {
  describe("useEventSettings tests", () => {
    test("Make params from location", () => {
      const placemark = EventMocks.PickupBasketball.location.placemark
      const { location } = useEventSettings()
    })
  })
})
