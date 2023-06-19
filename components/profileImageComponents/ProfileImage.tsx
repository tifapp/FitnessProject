import React from "react"
import { ImageBackground, ImageStyle, StyleProp } from "react-native"

interface ProfileImageProps {
  imageURL: string
  style?: StyleProp<ImageStyle>
}

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => {
  const defaultImage = require("@assets/default_profile.png")

  return (
    <ImageBackground
      source={defaultImage}
      style={[{ alignSelf: "center" }, style]}
    />
  )
}

export default ProfileImage
