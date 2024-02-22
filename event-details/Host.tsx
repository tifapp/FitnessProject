import { Headline, Caption, BodyText } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { CurrentUserEvent } from "@shared-models/Event"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"

export type EventDetailsHostProps = Pick<CurrentUserEvent, "host" | "color"> & {
  onFriendButtonTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const EventDetailsHostView = ({
  host,
  color,
  onFriendButtonTapped,
  style
}: EventDetailsHostProps) => (
  <View style={[style, styles.container]}>
    <ProfileImage
      imageURL={host.profileImageURL ?? undefined}
      style={styles.image}
    />
    <View style={styles.text}>
      <Headline>{host.username}</Headline>
      <Caption>{host.handle.toString()}</Caption>
    </View>
    <TouchableOpacity activeOpacity={0.3} onPress={onFriendButtonTapped}>
      <View style={[styles.button, { borderColor: color.toString() }]}>
        <View style={styles.buttonContent}>
          <Ionicon name="person-add" size={16} color={color.toString()} />
          <BodyText style={{ opacity: 1, color: color.toString() }}>
            Friend
          </BodyText>
        </View>
      </View>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
    alignItems: "center"
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 128
  },
  text: {
    flex: 1,
    rowGap: 4
  },
  button: {
    borderRadius: 12,
    borderWidth: 1
  },
  buttonContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    padding: 8
  }
})
