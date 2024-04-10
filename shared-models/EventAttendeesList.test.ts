import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { EventAttendeesList } from "./EventAttendeesList"

describe("EventAttendeesList tests", () => {
  describe("EventAttendeesListClass tests", () => {
    test("Returns all class properties properly", () => {
      const mockAttendeeData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        totalAttendeeCount: 2,
        nextPageCursor: null
      }
      const mockAttendeeData2 = {
        attendees: [EventAttendeeMocks.BlobJr, EventAttendeeMocks.BlobSr],
        totalAttendeeCount: 4,
        nextPageCursor: null
      }
      const testAttendeesList = new EventAttendeesList([
        mockAttendeeData,
        mockAttendeeData2
      ])
      expect(testAttendeesList.host).toEqual(EventAttendeeMocks.Alivs)
      expect(testAttendeesList.totalAttendeeCount).toEqual(4)
      expect(testAttendeesList.allCurrentPages).toEqual([
        mockAttendeeData,
        mockAttendeeData2
      ])
      expect(testAttendeesList.attendees).toEqual([
        EventAttendeeMocks.Alivs,
        EventAttendeeMocks.AnnaAttendee,
        EventAttendeeMocks.BlobJr,
        EventAttendeeMocks.BlobSr
      ])
    })
    // it("switches host with other attendee in list", () => {})
    // it("removes attendee from list", () => {})
  })
})
