import { BodyText, Caption, Headline, Title } from "@components/Text"
import { EventCard } from "@components/eventCard/EventCard"
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
        <Image
          style={styles.profileImage}
          source={require("@assets/Windows_10_Default_Profile_Picture.svg.png")}
        />
        <Title style={{ marginBottom: 8 }}>{user.username}</Title>
        <Caption>{user.handle}</Caption>
      </View>

      <View style={{ marginVertical: 24 }}>
        <Headline style={{ marginBottom: 16 }}>About</Headline>
        <BodyText>{user.biography}</BodyText>
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
