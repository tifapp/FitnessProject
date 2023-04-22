import { mockLocation } from "@lib/location"
import { asyncStorageSaveLocation } from "@lib/location/LocationStorage"
import { fakeTimers } from "../helpers/Timers"

describe("LocationStorage tests", () => {
  describe("AsyncStorageSaveLocation tests", () => {
    fakeTimers()

    it("should save the location in async storage", async () => {
      jest.setSystemTime(new Date("2023-04-21T00:00:00"))
      const save = jest.fn()
      const location = mockLocation({ latitude: 41.1234, longitude: -121.1234 })

      await asyncStorageSaveLocation(location, "attended-event", save)
      expect(save).toHaveBeenCalledWith("@location_9r3cgy29h", {
        ...location,
        timestamp: 1682060400,
        reason: "attended-event"
      })
    })
  })
})
