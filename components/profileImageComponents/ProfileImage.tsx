import { Image, ImageStyle, StyleProp } from "react-native"

interface ProfileImageProps {
  imageURL: string
  style?: StyleProp<ImageStyle>
}

const ProfileImage = ({imageURL, style}: ProfileImageProps) => {
  const defaultImage = require("@assets/icon.png")

  return <Image source={defaultImage} style={style}/>
}

export default ProfileImage