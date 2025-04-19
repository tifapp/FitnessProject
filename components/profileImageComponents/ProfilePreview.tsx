import { useFontScale } from "@lib/Fonts"
import React from "react"
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle
} from "react-native"
import { UserHandle } from "TiFShared/domain-models/User"
import { BodyText, Caption, Headline, Subtitle } from "../Text"
import { ProfileCircleView } from "./ProfileCircle"

interface ProfilePreviewProps {
  name: string
  handle: UserHandle
  imageURL: string | null | undefined
  maximumFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
  size?: "normal" | "large"
  imageStyle?: StyleProp<ImageStyle>
  textStyle?: StyleProp<TextStyle>
}

const SIZE_TEXT_COMPONENTS = {
  normal: [Headline, Caption],
  large: [Subtitle, BodyText]
}

const ProfilePreview = ({
  name,
  handle,
  imageURL,
  style,
  size = "normal",
  maximumFontSizeMultiplier,
  imageStyle,
  textStyle
}: ProfilePreviewProps) => {
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
        <Name style={textStyle}>{name}</Name>
        <Handle style={[styles.handle, textStyle]}>{handle.toString()}</Handle>
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
    opacity: 1
  }
})

export default ProfilePreview
