import React from "react"
import { ImageStyle, StyleProp, View, ViewStyle } from "react-native"
import { Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"

interface ImageAndNameProps {
  username: string
  userHandle: string
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const ProfileImageAndName = ({
  username,
  userHandle,
  style,
  imageStyle
}: ImageAndNameProps) => {
  return (
    <View style={[{ flexDirection: "row" }, style]}>
      <ProfileImage imageURL="@assets/default_profile.png" style={imageStyle} />
      <View style={{ marginLeft: 16 }}>
        <Headline style={{ marginBottom: 4 }}>{username}</Headline>
        <Caption>{userHandle}</Caption>
      </View>
    </View>
  )
}

export default ProfileImageAndName
