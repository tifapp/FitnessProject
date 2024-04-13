import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { uuidString } from "@lib/utils/UUID"
import { EventAttendeesList } from "./EventAttendeesList"

describe("EventAttendeesList tests", () => {
  describe("EventAttendeesListClass tests", () => {
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
    test("total attendee count", () => {
      expect(testAttendeesList.totalAttendeeCount).toEqual(4)
    })
    test("host", () => {
      expect(testAttendeesList.host).toEqual(EventAttendeeMocks.Alivs)
    })
    test("attendees", () => {
      expect(testAttendeesList.attendees()).toEqual([
        EventAttendeeMocks.AnnaAttendee,
        EventAttendeeMocks.BlobJr,
        EventAttendeeMocks.BlobSr
      ])
    })
    it("switches host with other attendee in list", () => {
      const attendeesList = testAttendeesList.swapHost(
        EventAttendeeMocks.BlobJr.id
      )
      expect(attendeesList.host).toEqual(EventAttendeeMocks.BlobJr)
      expect(attendeesList.attendees()).toEqual([
        EventAttendeeMocks.AnnaAttendee,
        EventAttendeeMocks.Alivs,
        EventAttendeeMocks.BlobSr
      ])
    })
    it("switches host with attendee right after original host in list", () => {
      const attendeesList = testAttendeesList.swapHost(
        EventAttendeeMocks.AnnaAttendee.id
      )
      expect(attendeesList.host).toEqual(EventAttendeeMocks.AnnaAttendee)
      expect(attendeesList.attendees()).toEqual([
        EventAttendeeMocks.Alivs,
        EventAttendeeMocks.BlobJr,
        EventAttendeeMocks.BlobSr
      ])
    })
    it("doesn't swap hosts if new host does not exist", () => {
      const attendeesList = testAttendeesList.swapHost(uuidString())
      expect(attendeesList.host).toEqual(EventAttendeeMocks.Alivs)
      expect(attendeesList.attendees()).toEqual([
        EventAttendeeMocks.AnnaAttendee,
        EventAttendeeMocks.BlobJr,
        EventAttendeeMocks.BlobSr
      ])
    })
    it("removes attendee from list", () => {
      const attendeesList = testAttendeesList.removeAttendee(
        EventAttendeeMocks.AnnaAttendee.id
      )
      expect(attendeesList.attendees()).toEqual([
        EventAttendeeMocks.BlobJr,
        EventAttendeeMocks.BlobSr
      ])
      expect(attendeesList.totalAttendeeCount).toEqual(3)
    })
    it("should not remove non-existent attendee from list", () => {
      const attendeesList = testAttendeesList.removeAttendee(
        EventAttendeeMocks.HaleyHost.id
      )
      expect(attendeesList).toEqual(testAttendeesList)
    })
  })
})
