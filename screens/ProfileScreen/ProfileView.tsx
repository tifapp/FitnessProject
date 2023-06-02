import React, { useState } from "react"
import { Caption, Headline, Title } from "@components/Text"
import {
  DisabledButton,
  OutlinedButton,
  PrimaryButton
} from "@components/common/Buttons"
import ExpandableText from "@components/common/ExpandableText"
import { ToastWithIcon } from "@components/common/Toasts"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { User } from "@lib/users/User"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import EventPager from "./EventCarousel"
import { AppStyles } from "@lib/AppColorStyle"
import EventHistoryModal from "./EventHistoryModal"
import { CurrentUserEvent } from "@lib/events"

export type ProfileScreenViewProps = {
  user: User
  events: CurrentUserEvent[]
}

const NUM_EVENTS_SHOWN = 20

const ProfileView = ({ user, events }: ProfileScreenViewProps) => {
  const [userStatus, setUserStatus] = useState(user.relationStatus)
  const [modalVisible, setModalVisible] = useState(false)
  const [requestSent, setRequestSent] = useState(
    !!(userStatus === "friend-request-pending" || userStatus === "friends")
  )
  const recentEvents = events.slice(0, NUM_EVENTS_SHOWN)

  const openModal = () => {
    setModalVisible(true)
  }

  return (
    <View style={styles.container}>
      <EventHistoryModal
        username={user.name}
        visible={modalVisible}
        setVisible={setModalVisible}
        events={events}
      />
      <ScrollView>
        <View style={[styles.spacing, styles.imageSection]}>
          <ProfileImage
            style={styles.profileImage}
            imageURL={user.profileImageURL}
          />
          <Title style={styles.title}>{user.name}</Title>
          <Caption>{`@${user.handle}`}</Caption>
        </View>

        {userStatus !== "current-user" && (
          <View style={[styles.spacing, styles.buttons]}>
            {userStatus === "not-friends" && (
              <PrimaryButton
                style={{ flex: 1 }}
                title="Add Friend"
                onPress={() => setUserStatus("friend-request-pending")}
              />
            )}
            {userStatus === "friend-request-pending" && (
              <DisabledButton title="Request Pending" />
            )}
            {userStatus === "friends" && <DisabledButton title="Friends" />}
            {userStatus !== "blocked" && (
              <OutlinedButton style={styles.messageButton} title="Message" />
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
            text={user.bio}
            linesToDisplay={3}
            style={{ color: AppStyles.highlightedText }}
          />
        </View>

        <View style={[styles.spacing, { flexDirection: "row" }]}>
          <Headline>Events</Headline>
          {events.length > 1 && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end"
              }}
            >
              <TouchableOpacity onPress={openModal}>
                <Headline style={{ color: AppStyles.highlightedText }}>
                  View All
                </Headline>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {events.length !== 0
          ? (
            <EventPager events={recentEvents} />
          )
          : (
            <View
              style={[
                styles.spacing,
                {
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }
              ]}
            >
              <Caption>{"Sorry, this user hasn't attended any events"}</Caption>
            </View>
          )}
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

export default ProfileView
