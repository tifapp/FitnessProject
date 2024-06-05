import React from "react"
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"
import { UserHandle } from "TiFShared/domain-models/User"

interface ImageAndNameProps {
  username: string
  handle: UserHandle
  imageURL: string | null
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const ProfileImageAndName = ({
  username,
  handle,
  imageURL,
  style
}: ImageAndNameProps) => (
  <View style={[style, styles.container]}>
    <ProfileImage imageURL={imageURL ?? undefined} style={styles.image} />
    <View style={styles.textContainer}>
      <Headline style={styles.handle}>{username}</Headline>
      <Caption>{handle.toString()}</Caption>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  image: {
    width: 40,
    height: 40
  },
  textContainer: {
    marginLeft: 8,
    flex: 1
  },
  handle: {
    marginTop: 4
  }
})

export default ProfileImageAndName
