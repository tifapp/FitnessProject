import { Headline, Caption, BodyText } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { UserHandle } from "@content-parsing"
import { AppStyles } from "@lib/AppColorStyle"
import { CurrentUserEvent } from "@shared-models/Event"
import { Pressable } from "react-native"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"

export type EventDetailsHostProps = Pick<CurrentUserEvent, "host"> & {
  onFriendButtonTapped: () => void
  onHostTapped: (handle: UserHandle) => void
  style?: StyleProp<ViewStyle>
}

export const EventDetailsHostView = ({
  host,
  onHostTapped,
  onFriendButtonTapped,
  style
}: EventDetailsHostProps) => (
  <View style={[style, styles.container]}>
    <Pressable
      onPress={() => onHostTapped(host.handle)}
      style={styles.pressableContainer}
    >
      <ProfileImage
        imageURL={host.profileImageURL ?? undefined}
        style={styles.image}
      />
      <View style={styles.text}>
        <Headline>{host.username}</Headline>
        <Caption>{host.handle.toString()}</Caption>
      </View>
    </Pressable>
    <View style={styles.spacer} />
    <TouchableOpacity activeOpacity={0.8} onPress={onFriendButtonTapped}>
      <View style={styles.button}>
        <View style={styles.buttonContent}>
          <Ionicon name="person-add" size={16} color="white" />
          <Headline style={{ opacity: 1, color: "white" }}>Friend</Headline>
        </View>
      </View>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  pressableContainer: {
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
    rowGap: 4
  },
  spacer: {
    flex: 1
  },
  button: {
    borderRadius: 12,
    backgroundColor: AppStyles.darkColor
  },
  buttonContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    padding: 8
  }
})
