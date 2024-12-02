import React from "react"
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { UserHandle } from "TiFShared/domain-models/User"
import { BodyText, Caption, Headline, Subtitle } from "../Text"
import ProfileImage from "./ProfileImage"
import { AvatarView } from "@components/Avatar"

interface ImageAndNameProps {
  name: string
  handle: UserHandle
  imageURL: string | null
  style?: StyleProp<ViewStyle>
  size?: "normal" | "large"
  imageStyle?: StyleProp<ImageStyle>
}

const SIZE_TEXT_COMPONENTS = {
  normal: [Headline, Caption],
  large: [Subtitle, BodyText]
}

const ProfileImageAndName = ({
  name,
  handle,
  imageURL,
  style,
  size = "normal",
  imageStyle
}: ImageAndNameProps) => {
  const profileImageStyle =
    imageStyle ?? (size === "normal" ? styles.image : styles.largeImage)
  const [Name, Handle] = SIZE_TEXT_COMPONENTS[size]
  return (
    <View style={[style, styles.container]}>
      {imageURL ? (
        <ProfileImage
          imageURL={imageURL ?? undefined}
          style={profileImageStyle}
        />
      ) : (
        <AvatarView name={name} style={profileImageStyle} />
      )}
      <View style={styles.textContainer}>
        <Name>{name}</Name>
        <Handle style={styles.handle}>{handle.toString()}</Handle>
      </View>
    </View>
  )
}

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
  largeImage: {
    width: 64,
    height: 64
  },
  textContainer: {
    marginLeft: 8,
    flex: 1
  },
  handle: {
    opacity: 0.5
  }
})

export default ProfileImageAndName
