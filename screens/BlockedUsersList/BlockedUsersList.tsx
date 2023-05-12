import { BodyText, Title } from "@components/Text"
import MenuDropdown from "@components/eventCard/MenuDropdown"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { AppStyles } from "@lib/AppColorStyle"
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native"

const BlockedUsersList = () => {
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
      <Title style={{ marginBottom: 8 }}>Blocked Users</Title>
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
            <MenuDropdown
              isEventHost={false}
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

export default BlockedUsersList
