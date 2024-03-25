import React from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"

interface ProfileImageProps {
  imageURL?: string
  style?: StyleProp<ImageStyle>
}

const fallbackImage = require("../../assets/default_profile.png")

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => {
  return (
    <Image
      defaultSource={fallbackImage}
      source={imageURL ? { uri: imageURL } : fallbackImage}
      style={[style, styles.image]}
    />
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 128
  }
})

export default ProfileImage
