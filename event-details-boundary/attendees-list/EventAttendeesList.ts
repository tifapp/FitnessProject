import { EventAttendeesPage } from "@event-details-boundary/attendees-list"
import { UserID } from "../../shared-models/User"

/**
 * An immutable data structure that represents an event's attendees list.
 */
export class EventAttendeesList {
  get host() {
    return this.pages[0].attendees[0]
  }

  /**
   * Overall attendee count, including pages that are not in this list.
   * This attendee count is a definitive count for the amount of attendees in an event.
   */
  get totalAttendeeCount() {
    return this.pages[this.pages.length - 1].totalAttendeeCount
  }

  attendees() {
    return this.pages
      .map((page, index) => {
        if (index === 0) return page.attendees.slice(1)
        return page.attendees
      })
      .flat()
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(readonly pages: EventAttendeesPage[]) {}

  /**
   * Swaps the current host of the EventAttendeesList with the given attendee in the list.
   *
   * @param newHostID The ID of the attendee to make the host.
   * @returns A new instance of the current EventAttendeesList with the host swapped.
   */
  swapHost(newHostID: UserID) {
    const attendeeLocation = this.indexOfAttendee(newHostID)
    if (!attendeeLocation) return this
    const newHost =
      this.pages[attendeeLocation.pageIndex].attendees[
        attendeeLocation.attendeeIndex
      ]
    const newAttendeesPages = this.pages.map((page, index) => {
      const attendees =
        index === 0 ? page.attendees.with(0, newHost) : page.attendees
      return {
        ...page,
        attendees:
          attendeeLocation.pageIndex === index
            ? attendees.with(attendeeLocation.attendeeIndex, this.host)
            : attendees
      }
    })
    return new EventAttendeesList(newAttendeesPages)
  }

  private indexOfAttendee(id: UserID) {
    for (let pageIndex = 0; pageIndex < this.pages.length; pageIndex++) {
      const attendeeIndex = this.pages[pageIndex].attendees.findIndex(
        (attendee) => attendee.id === id
      )
      if (attendeeIndex !== -1) {
        return { pageIndex, attendeeIndex }
      }
    }
    return undefined
  }

  /**
   * Removes an attendee from this list.
   *
   * @param id The id of the attendee to remove from the list.
   * @returns A new instance of this current EventAttendeesList with the attendee removed.
   */
  removeAttendee(id: UserID) {
    let didRemoveAttendee = false
    const pages = this.pages.map((page, index) => {
      const attendees = page.attendees.filter((attendee) => attendee.id !== id)
      didRemoveAttendee =
        didRemoveAttendee || attendees.length !== page.attendees.length
      const isLastPage = this.pages.length - 1 === index
      if (didRemoveAttendee && isLastPage) {
        return {
          ...page,
          attendees,
          totalAttendeeCount: page.totalAttendeeCount - 1
        }
      }
      return { ...page, attendees }
    })
    return new EventAttendeesList(pages)
  }
}
