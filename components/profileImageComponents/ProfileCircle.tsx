import { StyleProp } from "react-native"
import ProfileImage from "./ProfileImage"
import { AvatarView } from "@components/Avatar"
import { ImageStyle } from "expo-image"

export type ProfileCircleProps = {
  imageURL?: string | null | undefined
  name: string
  maximumFontSizeMultiplier?: number
  style?: StyleProp<ImageStyle>
}

export const ProfileCircleView = ({
  imageURL,
  name,
  maximumFontSizeMultiplier,
  style
}: ProfileCircleProps) =>
  imageURL ? (
    <ProfileImage imageURL={imageURL ?? undefined} style={style} />
  ) : (
    <AvatarView
      name={name}
      maximumFontSizeMultiplier={maximumFontSizeMultiplier}
      style={style}
    />
  )
