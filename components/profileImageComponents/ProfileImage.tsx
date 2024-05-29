import React from "react"
import { ImageStyle, StyleProp, StyleSheet } from "react-native"
import { Image } from "expo-image"

interface ProfileImageProps {
  imageURL?: string | null
  style?: StyleProp<ImageStyle>
}

// TODO: - Placeholder

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => (
  <Image source={imageURL} style={[style, styles.image]} />
)

const styles = StyleSheet.create({
  image: {
    borderRadius: 128
  }
})

export default ProfileImage
