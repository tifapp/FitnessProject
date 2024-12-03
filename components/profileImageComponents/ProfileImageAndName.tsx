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
import { ProfileCircleView } from "./ProfileCircle"
import { useFontScale } from "@lib/Fonts"

interface ImageAndNameProps {
  name: string
  handle: UserHandle
  imageURL: string | null | undefined
  maximumFontSizeMultiplier?: number
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
  maximumFontSizeMultiplier,
  imageStyle
}: ImageAndNameProps) => {
  const fontScale = useFontScale({
    maximumScaleFactor: maximumFontSizeMultiplier
  })
  const profileImageStyle =
    imageStyle ??
    (size === "normal"
      ? { width: 40 * fontScale, height: 40 * fontScale }
      : { width: 64 * fontScale, height: 64 * fontScale })
  const [Name, Handle] = SIZE_TEXT_COMPONENTS[size]
  return (
    <View style={[style, styles.container]}>
      <ProfileCircleView
        imageURL={imageURL}
        name={name}
        maximumFontSizeMultiplier={maximumFontSizeMultiplier}
        style={profileImageStyle}
      />
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
