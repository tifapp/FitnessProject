import React from "react"
import { View, StyleSheet } from "react-native"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import { EventAttendee } from "@lib/events"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"

export type BlockedUserProps = {
  attendee: EventAttendee
}

const BlockedUserEntry = ({ attendee }: BlockedUserProps) => {
  return (
    <View style={[styles.listContainer, styles.horizontalPadding]}>
      <ProfileImageAndName
        username={attendee.username}
        userHandle={attendee.handle}
        imageURL={"item.url"}
        imageStyle={styles.image}
      />
      <ConfirmationDialogue
        options={[
          `Unblock ${attendee.username}`,
          `Report ${attendee.username}`
        ]}
        style={{
          flex: 1,
          flexDirection: "row",
          alignSelf: "center",
          justifyContent: "flex-end"
        }}
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
  },
  horizontalPadding: {
    marginHorizontal: 16
  }
})

export default BlockedUserEntry
