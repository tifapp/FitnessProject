import {ImageStyle, StyleProp,View, ViewStyle } from "react-native"
import { Caption, Headline } from "../Text"
import AddFriendText from "../friendComponents/AddFriendText"
import ProfileImage from "./ProfileImage"

interface ImageAndNameProps {
  displayFriend: boolean
  style?: StyleProp<ViewStyle>,
  imageStyle?: StyleProp<ImageStyle>
  username: string
  userHandle: string
  eventColor: string
}

const ProfileImageAndName = ({
  displayFriend,
  style,
  imageStyle,
  username,
  userHandle,
  eventColor
}: ImageAndNameProps) => {

  return (
    <View style={[{flexDirection: "row"}, style]}>
      <ProfileImage imageURL="@assets/icon.png" style={imageStyle}/>
      <View>
        <View style={{flexDirection: "row"}}>
          <Headline>{username}</Headline>
          {displayFriend && <AddFriendText eventColor={eventColor} />}
        </View>
        <Caption>{userHandle}</Caption>
      </View>
    </View>
  )
}

export default ProfileImageAndName