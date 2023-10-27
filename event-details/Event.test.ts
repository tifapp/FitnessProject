import { isAttendingEvent, isHostingEvent } from "./Event"

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
})
