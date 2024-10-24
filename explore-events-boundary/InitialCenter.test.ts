import { mockLocationCoordinate2D } from "@location/MockData"
import { createInitialCenter } from "./InitialCenter"

describe("ExploreEventsModels tests", () => {
  describe("CreateInitialCenter tests", () => {
    it("should be user-location when undefined", () => {
      expect(createInitialCenter(undefined)).toMatchObject({
        center: "user-location"
      })
    })

    it("should be preset when coordinates passed", () => {
      const coordinate = mockLocationCoordinate2D()
      expect(createInitialCenter(coordinate)).toMatchObject({
        center: "preset",
        coordinate
      })
    })
  })
})
