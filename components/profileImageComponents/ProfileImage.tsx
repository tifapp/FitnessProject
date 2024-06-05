import React from "react"
import { View, ImageStyle, StyleProp, StyleSheet } from "react-native"

interface ProfileImageProps {
  imageURL?: string
  style?: StyleProp<ImageStyle>
}

// TODO: - Async Image Library

const ProfileImage = ({ style }: ProfileImageProps) => (
  <View style={[style, styles.image]} />
)

const styles = StyleSheet.create({
  image: {
    borderRadius: 128,
    backgroundColor: "grey"
  }
})

export default ProfileImage
