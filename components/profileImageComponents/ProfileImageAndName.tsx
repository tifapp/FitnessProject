import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { BodyText, Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"
import React, { useState } from "react"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import Toast from "react-native-root-toast"

type UserFriendStatus =
  | "not-friends"
  | "friend-request-pending"
  | "friends"
  | "blocked"

interface ImageAndNameProps {
  username: string
  eventColor?: string
  displayFriend?: boolean
  displayHandle?: boolean
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  userHandle?: string
  userFriendStatus?: UserFriendStatus | undefined
  toastOffset?: number
}

const ProfileImageAndName = ({
  username,
  eventColor,
  displayFriend,
  displayHandle,
  style,
  imageStyle,
  userHandle,
  userFriendStatus,
  toastOffset
}: ImageAndNameProps) => {
  const [friendStatus, setFriendStatus] = useState(userFriendStatus)
  const offset = toastOffset || 0

  const renderFriendStatus = (status: UserFriendStatus | undefined) => {
    switch (status) {
    case "not-friends":
      return "Add Friend"

    case "friends":
      return "Friends"

    case "friend-request-pending":
      return "Request Sent"

    default:
      return null
    }
  }

  const setStatus = () => {
    if (friendStatus === "not-friends") {
      setFriendStatus("friend-request-pending")
    }
  }

  return (
    <View style={[{ flexDirection: "row" }, style]}>
      <ProfileImage imageURL="@assets/icon.png" style={imageStyle} />
      <View>
        <View style={{ flexDirection: "row" }}>
          <Headline>{username}</Headline>
          {displayFriend && friendStatus && friendStatus !== "blocked" && (
            <View style={[{ flexDirection: "row", alignItems: "center" }]}>
              <Ionicon
                style={{ marginHorizontal: 8 }}
                size={6}
                color={AppStyles.colorOpacity35}
                name="ellipse"
              />
              <Headline
                style={{
                  color:
                    friendStatus === "not-friends"
                      ? eventColor
                      : AppStyles.colorOpacity35
                }}
                onPress={setStatus}
              >
                {renderFriendStatus(friendStatus)}
              </Headline>
              <Toast
                visible={friendStatus === "friend-request-pending"}
                opacity={1}
                position={Toast.positions.BOTTOM - offset}
                shadow={false}
                animation={true}
                hideOnPress={true}
                containerStyle={styles.toastStyle}
              >
                <View style={{ flexDirection: "row" }}>
                  <View style={{ marginRight: 16 }}>
                    <Ionicon color="white" name="close" />
                  </View>
                  <BodyText
                    style={{ color: "white", textAlignVertical: "center" }}
                  >
                    {"Friend request sent"}
                  </BodyText>
                </View>
              </Toast>
            </View>
          )}
        </View>
        {displayHandle && <Caption>{userHandle}</Caption>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toastStyle: {
    borderRadius: 12,
    width: "90%",
    backgroundColor: AppStyles.darkColor,
    alignItems: "flex-start"
  }
})

export default ProfileImageAndName
