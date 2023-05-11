import { ImageStyle, StyleProp, View, ViewStyle } from "react-native"
import { Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"
import React from "react"

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
      <ProfileImage imageURL="@assets/icon.png" style={imageStyle} />
      <View>
        <Headline>{username}</Headline>
        <Caption>{userHandle}</Caption>
      </View>
    </View>
  )
}

export default ProfileImageAndName
