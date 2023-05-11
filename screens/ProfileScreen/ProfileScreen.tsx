import { BodyText, Caption, Headline, Title } from "@components/Text"
import { OutlinedButton, PrimaryButton } from "@components/common/Buttons"
import ExpandableText from "@components/common/ExpandableText"
import { EventCard } from "@components/eventCard/EventCard"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import { User } from "@lib/User"
import { Image, ScrollView, StyleSheet, View } from "react-native"

interface ProfileScreenProps {
  user: User
}

const ProfileScreen = ({ user }: ProfileScreenProps) => {
  const colorText = "#4285F4"
  return (
    <ScrollView
      style={{ marginHorizontal: 16 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ alignItems: "center", marginTop: 16 }}>
        <ProfileImage
          style={styles.profileImage}
          imageURL={user.profileImageURL}
        />
        <Title style={{ marginBottom: 8 }}>{user.username}</Title>
        <Caption>{user.handle}</Caption>
      </View>

      {user.friendStatus !== "current-user" && (
        <View
          style={{
            flexDirection: "row",
            marginTop: 20
          }}
        >
          {user.friendStatus === "not-friends" && (
            <PrimaryButton style={{ flex: 1 }} title="Add Friend" />
          )}
          {user.friendStatus !== "blocked" && (
            <OutlinedButton
              style={{
                flex: 1,
                marginLeft: user.friendStatus === "not-friends" ? 16 : 0
              }}
              title="Message"
            />
          )}
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
            <Headline style={{ color: colorText }}>View All</Headline>
          </View>
        )}
      </View>
      {user.events.length !== 0
        ? (
          <EventCard event={user.events[0]} />
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
  )
}

const styles = StyleSheet.create({
  profileImage: {
    width: 80,
    height: 80,
    marginBottom: 24
  }
})

export default ProfileScreen
