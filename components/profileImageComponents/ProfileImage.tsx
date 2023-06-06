import React from "react"
import { Image, ImageStyle, StyleProp } from "react-native"

interface ProfileImageProps {
  imageURL: string
  style?: StyleProp<ImageStyle>
}

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => {
  const defaultImage = require("@assets/default_profile.png")

  return (
    <Image source={defaultImage} style={[{ alignSelf: "center" }, style]} />
  )
}

export default ProfileImage
