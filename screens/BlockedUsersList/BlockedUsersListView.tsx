import React from "react"
import { BodyText, Subtitle } from "@components/Text"
import MenuDropdown from "@components/eventCard/MenuDropdown"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { AppStyles } from "@lib/AppColorStyle"
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native"
import ConfirmationDialogue from "@components/profileImageComponents/ConfirmationDialogue"

const BlockedUsersListView = () => {
  type TempUser = {
    username: string
    handle: string
    url: string
  }
  const users: TempUser[] = [
    {
      username: "sfdf",
      handle: "@sdfs",
      url: "dsfsdsdg"
    },
    {
      username: "sfdf",
      handle: "@sdfs",
      url: "dsfsdsdg"
    },
    {
      username: "sfdf",
      handle: "@sdfs",
      url: "dsfsdsdg"
    }
  ]

  return (
    <View style={{ marginTop: 24, marginHorizontal: 16 }}>
      <Subtitle style={{ marginBottom: 8 }}>Blocked Users</Subtitle>
      <BodyText style={{ color: AppStyles.colorOpacity50, marginBottom: 24 }}>
        Users you have blocked cannot join your events or view your profile, but
        you can still view their profile.
      </BodyText>

      <FlatList
        data={users}
        renderItem={({ item }: ListRenderItemInfo<TempUser>) => (
          <View style={styles.listContainer}>
            <ProfileImageAndName
              username={item.username}
              userHandle={item.handle}
              imageURL={item.url}
              imageStyle={styles.image}
            />
            <ConfirmationDialogue
              style={{
                flex: 1,
                flexDirection: "row",
                alignSelf: "center",
                justifyContent: "flex-end"
              }}
            />
          </View>
        )}
      ></FlatList>
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

export default BlockedUsersListView
