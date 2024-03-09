import { Headline, Caption } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { UserHandle } from "@content-parsing"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import { CurrentUserEvent } from "@shared-models/Event"
import { isCurrentUserRelations } from "@shared-models/User"
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
  onEditEventTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const EventDetailsHostView = ({
  host,
  onHostTapped,
  onFriendButtonTapped,
  onEditEventTapped,
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
        <Headline maxFontSizeMultiplier={FontScaleFactors.xxxLarge}>
          {host.username}
        </Headline>
        <Caption maxFontSizeMultiplier={FontScaleFactors.xxxLarge}>
          {host.handle.toString()}
        </Caption>
      </View>
    </Pressable>
    <View style={styles.spacer} />
    {/* TODO: - Show other friend button statuses. */}
    {!isCurrentUserRelations(host.relations) ? (
      <TouchableOpacity activeOpacity={0.8} onPress={onFriendButtonTapped}>
        <View style={styles.button}>
          <View style={styles.buttonContent}>
            <Ionicon
              name="person-add"
              size={16}
              color="white"
              maximumFontScaleFactor={FontScaleFactors.xxxLarge}
            />
            <Headline
              maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
              style={styles.friendButtonText}
            >
              Friend
            </Headline>
          </View>
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={onEditEventTapped}>
        <View style={styles.editEventButton}>
          <Ionicon
            name="pencil"
            maximumFontScaleFactor={FontScaleFactors.xxxLarge}
          />
          <Headline maxFontSizeMultiplier={FontScaleFactors.xxxLarge}>
            Edit Event
          </Headline>
        </View>
      </TouchableOpacity>
    )}
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
  },
  editEventButton: {
    display: "flex",
    flexDirection: "row",
    columnGap: 8
  },
  friendButtonText: {
    opacity: 1,
    color: "white"
  }
})
