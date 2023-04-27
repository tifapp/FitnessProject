import { EventAttendee } from "@lib/events"
import { View } from "react-native"

export type EventAttendeeProps = {
  attendee: EventAttendee
}

export const AttendeeEntry = ({ attendee }: EventAttendeeProps) => {
  /**
   * Want a couple of params:
   * Name and profile picture
   * Show username on right, profile picture (circle) on left
   *
   * Given: id + username
   * Want: Profile picture?
   *
   *
   * Click on the entry to allow for navigating to the profile; backlog stuff
   */

  return (
    /**
     * The attendees themselves
     *
     */
    <View></View>
  )
}
