import { Caption, Headline, Title } from "@components/Text"
import { OutlinedButton, PrimaryButton } from "@components/common/Buttons"
import ExpandableText from "@components/common/ExpandableText"
import { ToastWithIcon } from "@components/common/Toasts"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { User } from "@lib/users/User"
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import EventPager from "./EventCarousel"
import AllEventsModal from "./AllEventsModal"
import { AppStyles } from "@lib/AppColorStyle"

export interface ProfileScreenProps {
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
        username={user.username}
        visible={modalVisible}
        setVisible={setModalVisible}
        events={user.events}
      />
      <ScrollView>
        <View style={[styles.spacing, styles.imageSection]}>
          <ProfileImage
            style={styles.profileImage}
            imageURL={user.profileImageURL}
          />
          <Title style={styles.title}>{user.username}</Title>
          <Caption>{`@${user.handle}`}</Caption>
        </View>

        {userStatus !== "current-user" && (
          <View style={[styles.spacing, styles.buttons]}>
            {userStatus === "not-friends" && (
              <PrimaryButton
                style={{ flex: 1 }}
                title="Add Friend"
                onPress={setStatus}
              />
            )}
            {userStatus === "friend-request-pending" && (
              <OutlinedButton
                style={styles.disabledButton}
                textStyle={styles.textButton}
                title="Request Pending"
                disabled
              />
            )}
            {userStatus === "friends" && (
              <OutlinedButton
                style={styles.disabledButton}
                textStyle={styles.textButton}
                title="Friends"
                disabled
              />
            )}
            {userStatus !== "blocked" && (
              <OutlinedButton
                style={styles.messageButton}
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

        <View style={[styles.spacing, { marginVertical: 24 }]}>
          <Headline style={{ marginBottom: 16 }}>About</Headline>
          <ExpandableText
            text={user.biography}
            linesToDisplay={3}
            style={{ color: colorText }}
          />
        </View>

        <View style={[styles.spacing, { flexDirection: "row"}]}>
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
              style={[
                styles.spacing,
                {
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }]}
            >
              <Caption>Sorry, this user hasn't attended any events</Caption>
            </View>
          )
        }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  profileImage: {
    width: 80,
    height: 80,
    marginBottom: 24
  },
  disabledButton: {
    flex: 1,
    backgroundColor: AppStyles.darkColor + "0D",
    borderWidth: 0
  },
  textButton: {
    color: AppStyles.colorOpacity50
  },
  spacing: {
    paddingHorizontal: 16
  },
  imageSection: {
    alignItems: "center",
    marginTop: 16
  },
  title: {
    marginBottom: 8
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20
  },
  messageButton: {
    flex: 1,
    marginLeft: 16
  }
})

export default ProfileScreen
