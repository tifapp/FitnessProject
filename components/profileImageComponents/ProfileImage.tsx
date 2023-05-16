import { Image, ImageStyle, StyleProp } from "react-native"

interface ProfileImageProps {
  imageURL: string
  style?: StyleProp<ImageStyle>
}

const ProfileImage = ({ imageURL, style }: ProfileImageProps) => {
  const defaultImage = require("@assets/Windows_10_Default_Profile_Picture.svg.png")

  return (
    <Image source={defaultImage} style={[{ alignSelf: "center" }, style]} />
  )
}

export default ProfileImage
