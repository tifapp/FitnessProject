import {
  copyEventLocationToClipboard,
  isAttendingEvent,
  isHostingEvent
} from "./Event"

describe("Event tests", () => {
  describe("EventCurrentUserAttendeeStatus tests", () => {
    describe("isHostingEvent tests", () => {
      it("returns true for hosting", () => {
        expect(isHostingEvent("hosting")).toEqual(true)
      })

      it("returns false for attending", () => {
        expect(isHostingEvent("attending")).toEqual(false)
      })

      it("returns false for non-participating", () => {
        expect(isHostingEvent("not-participating")).toEqual(false)
      })
    })

    describe("isAttendingEvent tests", () => {
      it("returns true for hosting", () => {
        expect(isAttendingEvent("hosting")).toEqual(true)
      })

      it("returns true for attending", () => {
        expect(isAttendingEvent("attending")).toEqual(true)
      })

      it("returns false for not-participating", () => {
        expect(isAttendingEvent("not-participating")).toEqual(false)
      })
    })
  })

  describe("EventLocation tests", () => {
    const TEST_COORDINATES = { latitude: 45.238974, longitude: -122.3678 }
    const TEST_COORDINATES_FORMATTED = "45.238974, -122.3678"

    it("should copy coordinates to clipboard when no placemark availiable", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        { coordinate: TEST_COORDINATES },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith(TEST_COORDINATES_FORMATTED)
    })

    it("should copy the coordinates to clipboard when placemark can't be formatted", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        {
          coordinate: TEST_COORDINATES,
          placemark: { name: "North Pacific Ocean" }
        },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith(TEST_COORDINATES_FORMATTED)
    })

    it("should copy the formatted address of an event with a placemark", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        {
          coordinate: TEST_COORDINATES,
          placemark: {
            name: "Starbucks",
            country: "United States of America",
            postalCode: "69696",
            street: "Thing St",
            streetNumber: "6969",
            region: "CA",
            isoCountryCode: "US",
            city: "City"
          }
        },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith("6969 Thing St, City, CA 69696")
    })
  })
})
