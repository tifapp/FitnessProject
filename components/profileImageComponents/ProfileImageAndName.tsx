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

interface ImageAndNameProps {
  username: string
  userHandle: string
  imageURL?: string
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const ProfileImageAndName = ({
  username,
  userHandle,
  imageURL,
  style
}: ImageAndNameProps) => (
  <View style={[style, styles.container]}>
    <ProfileImage imageURL={imageURL} style={styles.image} />
    <View style={styles.textContainer}>
      <Headline style={styles.handle}>{username}</Headline>
      <Caption>@{userHandle}</Caption>
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
    marginLeft: 16
  },
  handle: {
    marginTop: 4
  }
})

export default ProfileImageAndName
