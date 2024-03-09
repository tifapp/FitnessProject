import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import ProfileImage from "./profileImageComponents/ProfileImage"
import { useFontScale } from "@lib/Fonts"

export type AvatarMapMarkerProps = {
  imageURL?: string
  children?: JSX.Element
  maximumFontScaleFactor?: number
  style?: StyleProp<ViewStyle>
}

export const AVATAR_MARKER_SIZE = 44

/**
 * A map marker component that displays an avatar.
 */
export const AvatarMapMarkerView = ({
  imageURL,
  children,
  maximumFontScaleFactor,
  style
}: AvatarMapMarkerProps) => {
  const fontScale = useFontScale({ maximumScaleFactor: maximumFontScaleFactor })
  return (
    <View style={[style, { width: 96 * fontScale, height: 64 * fontScale }]}>
      <View style={styles.container}>
        <View style={styles.markerContainer}>
          {children}
          <View
            style={[
              styles.whiteBackground,
              {
                width: AVATAR_MARKER_SIZE * fontScale,
                height: AVATAR_MARKER_SIZE * fontScale
              }
            ]}
          >
            <ProfileImage
              imageURL={imageURL}
              style={[
                styles.imageBackground,
                {
                  width: (AVATAR_MARKER_SIZE - 2) * fontScale,
                  height: (AVATAR_MARKER_SIZE - 2) * fontScale
                }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
