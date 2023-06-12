import React from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"

interface ProfileImageProps {
  imageURL: string
  style?: StyleProp<ImageStyle>
}

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => {
  return <Image source={{ uri: imageURL }} style={[style, styles.image]} />
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 128
  }
})

export default ProfileImage
