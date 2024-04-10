import { EventAttendeesPage } from "@event-details-boundary/attendees-list"
import { EventAttendee } from "./Event"
import { UserID } from "./User"

export class EventAttendeesList {
  private _pages: EventAttendeesPage[]

  get host() {
    return this.allCurrentPages[0].attendees[0]
  }

  get totalAttendeeCount() {
    return this.allCurrentPages[this._pages.length - 1].totalAttendeeCount
  }

  get allCurrentPages() {
    return this._pages
  }

  get attendees() {
    const attendees: EventAttendee[][] = []
    this.allCurrentPages.forEach((page) => attendees.push(page.attendees))
    return attendees.flat()
  }

  constructor(private pages: EventAttendeesPage[]) {
    this._pages = pages
  }

  swapHostTo(attendee: EventAttendee) {}
  removeAttendee(id: UserID) {}
}
