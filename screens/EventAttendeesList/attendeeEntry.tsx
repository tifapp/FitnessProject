import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { EventAttendee } from "@lib/events"
import { StyleSheet, View } from "react-native"

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
    <View style={styles.listContainer}>
      <ProfileImageAndName
        username={attendee.username}
        userHandle={attendee.handle}
        imageStyle={styles.image}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  listContainer: {
    marginBottom: 16,
    flexDirection: "row"
  }
})
