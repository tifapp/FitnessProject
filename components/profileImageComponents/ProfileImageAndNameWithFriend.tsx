import { ImageStyle, StyleProp, View, ViewStyle } from "react-native"
import { Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"
import React, { useState } from "react"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { FriendToast } from "@components/common/Toasts"

export type UserFriendStatus =
  | "not-friends"
  | "friend-request-pending"
  | "friends"
  | "blocked"

interface ImageAndNameProps {
  username: string
  userHandle: string
  eventColor: string
  userFriendStatus: UserFriendStatus | undefined
  toastOffset: number
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const ProfileImageAndNameWithFriend = ({
  username,
  userHandle,
  eventColor,
  userFriendStatus,
  toastOffset,
  style,
  imageStyle
}: ImageAndNameProps) => {
  const [friendStatus, setFriendStatus] = useState(userFriendStatus)
  const [requestSent, setRequestSent] = useState(
    !!(friendStatus === "friend-request-pending" || friendStatus === "friends")
  )

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
          {friendStatus && friendStatus !== "blocked" && (
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
              <FriendToast
                requestSent={requestSent}
                setRequestSent={setRequestSent}
                friendStatus={friendStatus}
                offset={toastOffset}
              />
            </View>
          )}
        </View>
        <Caption>{userHandle}</Caption>
      </View>
    </View>
  )
}

export default ProfileImageAndNameWithFriend
