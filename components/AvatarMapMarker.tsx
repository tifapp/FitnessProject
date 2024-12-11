import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { ProfileCircleView } from "./profileImageComponents/ProfileCircle"

export type AvatarMapMarkerProps = {
  name: string
  imageURL?: string
  children?: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const AVATAR_MARKER_SIZE = 44

/**
 * A map marker component that displays an avatar.
 */
export const AvatarMapMarkerView = ({
  name,
  imageURL,
  children,
  style
}: AvatarMapMarkerProps) => (
  <View style={[style, styles.frame]}>
    <View style={styles.container}>
      <View style={styles.markerContainer}>
        {children}
        <View style={styles.whiteBackground}>
          <ProfileCircleView
            name={name}
            imageURL={imageURL}
            style={styles.imageBackground}
          />
        </View>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  frame: {
    width: 96,
    height: 64
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  whiteBackground: {
    zIndex: 1,
    width: AVATAR_MARKER_SIZE,
    height: AVATAR_MARKER_SIZE,
    backgroundColor: "white",
    borderRadius: 128,
    justifySelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  imageBackground: {
    width: AVATAR_MARKER_SIZE - 2,
    height: AVATAR_MARKER_SIZE - 2,
    borderRadius: 128,
    overflow: "hidden"
  },
  badgeContainer: {
    zIndex: 2,
    flex: 1,
    top: -8,
    right: -AVATAR_MARKER_SIZE / 2,
    padding: 4,
    position: "absolute",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "scroll"
  },
  badgeIcon: {
    marginLeft: 4
  },
  badgeText: {
    marginLeft: 4,
    marginRight: 4,
    color: "white"
  }
})
