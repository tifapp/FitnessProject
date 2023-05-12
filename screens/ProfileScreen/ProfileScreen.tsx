import { Caption, Headline, Title } from "@components/Text"
import { OutlinedButton, PrimaryButton } from "@components/common/Buttons"
import ExpandableText from "@components/common/ExpandableText"
import { ToastWithIcon } from "@components/common/Toasts"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { User } from "@lib/User"
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import EventPager from "./EventPager"
import AllEventsModal from "./AllEventsModal"

interface ProfileScreenProps {
  user: User
}

const NUM_EVENTS_SHOWN = 20

const ProfileScreen = ({ user }: ProfileScreenProps) => {
  const [userStatus, setUserStatus] = useState(user.userStatus)
  const [modalVisible, setModalVisible] = useState(false)
  const [requestSent, setRequestSent] = useState(
    !!(userStatus === "friend-request-pending" || userStatus === "friends")
  )
  const colorText = "#4285F4"
  const firstEvents = user.events.slice(0, NUM_EVENTS_SHOWN)

  const setStatus = () => {
    setUserStatus("friend-request-pending")
  }

  const openModal = () => {
    setModalVisible(true)
  }

  return (
    <View style={styles.container}>
      <AllEventsModal
        visible={modalVisible}
        setVisible={setModalVisible}
        events={user.events}
      />
      <ScrollView>
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <ProfileImage
            style={styles.profileImage}
            imageURL={user.profileImageURL}
          />
          <Title style={{ marginBottom: 8 }}>{user.username}</Title>
          <Caption>{user.handle}</Caption>
        </View>

        {userStatus !== "current-user" && (
          <View
            style={{
              flexDirection: "row",
              marginTop: 20
            }}
          >
            {userStatus === "not-friends" && (
              <PrimaryButton
                style={{ flex: 1 }}
                title="Add Friend"
                onPress={setStatus}
              />
            )}
            {userStatus !== "blocked" && (
              <OutlinedButton
                style={{
                  flex: 1,
                  marginLeft: userStatus === "not-friends" ? 16 : 0
                }}
                title="Message"
              />
            )}
            <ToastWithIcon
              requestSent={requestSent}
              setRequestSent={setRequestSent}
              isVisible={userStatus === "friend-request-pending"}
              text="Friend request sent."
            />
          </View>
        )}

        <View style={{ marginVertical: 24 }}>
          <Headline style={{ marginBottom: 16 }}>About</Headline>
          <ExpandableText
            text={user.biography}
            linesToDisplay={3}
            style={{ color: colorText }}
          />
        </View>

        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <Headline>Events</Headline>
          {user.events.length > 1 && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end"
              }}
            >
              <TouchableOpacity onPress={openModal}>
                <Headline style={{ color: colorText }}>View All</Headline>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {user.events.length !== 0
          ? (
            <EventPager events={firstEvents} />
          )
          : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Caption>Sorry, this user hasn't attended any events</Caption>
            </View>
          )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "white"
  },
  profileImage: {
    width: 80,
    height: 80,
    marginBottom: 24
  }
})

export default ProfileScreen
