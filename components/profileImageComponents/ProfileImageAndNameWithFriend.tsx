import { ImageStyle, StyleProp, View, ViewStyle } from "react-native"
import { Caption, Headline } from "../Text"
import ProfileImage from "./ProfileImage"
import React, { useState } from "react"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { TextToastView } from "@components/common/Toasts"
import { UserToProfileRelationStatus } from "@lib/users"

interface ImageAndNameProps {
  username: string
  userHandle: string
  eventColor: string
  userFriendStatus: UserToProfileRelationStatus | undefined
  imageURL?: string
  toastOffset: number
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const ProfileImageAndNameWithFriend = ({
  username,
  userHandle,
  eventColor,
  userFriendStatus,
  style,
  imageURL,
  imageStyle
}: ImageAndNameProps) => {
  const [friendStatus, setFriendStatus] = useState(userFriendStatus)
  const [requestSent, setRequestSent] = useState(
    !!(friendStatus === "friend-request-pending" || friendStatus === "friends")
  )

  const renderFriendStatus = (
    status: UserToProfileRelationStatus | undefined
  ) => {
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
      <ProfileImage imageURL={imageURL} style={imageStyle} />
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
              <TextToastView
                requestSent={requestSent}
                setRequestSent={setRequestSent}
                isVisible={friendStatus === "friend-request-pending"}
                text="Friend request sent."
              />
            </View>
          )}
        </View>
        <Caption>{`@${userHandle}`}</Caption>
      </View>
    </View>
  )
}

export default ProfileImageAndNameWithFriend
