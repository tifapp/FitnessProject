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
import { Ionicons } from "@expo/vector-icons"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import Toast from "react-native-root-toast"

interface ImageAndNameProps {
  displayFriend?: boolean
  displayHandle?: boolean
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  username: string
  userHandle: string
  eventColor: string
  toastOffset?: number
}

const ProfileImageAndName = ({
  displayFriend,
  displayHandle,
  style,
  imageStyle,
  username,
  userHandle,
  eventColor,
  toastOffset
}: ImageAndNameProps) => {
  const [isFriend] = useState(false)
  const [requestSent, setRequestSent] = useState(isFriend)
  const offset = toastOffset || 0

  return (
    <View style={[{ flexDirection: "row" }, style]}>
      <ProfileImage imageURL="@assets/icon.png" style={imageStyle} />
      <View>
        <View style={{ flexDirection: "row" }}>
          <Headline>{username}</Headline>
          {displayFriend &&
            (!isFriend
              ? (
                !requestSent
                  ? (
                    <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                      <Ionicon
                        style={{ marginHorizontal: 8 }}
                        size={6}
                        color={AppStyles.colorOpacity35}
                        name="ellipse"
                      />
                      <Headline
                        onPress={() => setRequestSent(true)}
                        style={{ color: eventColor }}
                      >
                    Add Friend
                      </Headline>
                    </View>
                  )
                  : (
                    <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                      <Ionicons
                        style={{ marginHorizontal: 8 }}
                        color={AppStyles.colorOpacity35}
                        size={6}
                        name="ellipse"
                      />
                      <Headline
                        style={{ opacity: 0.35 }}
                        onPress={() => setRequestSent(true)}
                      >
                    Request Sent
                      </Headline>
                      <Toast
                        visible={requestSent}
                        opacity={1}
                        position={Toast.positions.BOTTOM - offset}
                        shadow={false}
                        animation={true}
                        hideOnPress={true}
                        containerStyle={styles.toastStyle}
                      >
                        <View style={styles.containerStyle}>
                          <View style={styles.iconStyle}>
                            <Ionicon color="white" name="close" />
                          </View>
                          <BodyText style={styles.textStyle}>
                            {"Friend request sent"}
                          </BodyText>
                        </View>
                      </Toast>
                    </View>
                  )
              )
              : (
                <View>
                  <Ionicons
                    style={{ marginHorizontal: 8 }}
                    color={AppStyles.colorOpacity35}
                    size={6}
                    name="ellipse"
                  />
                  <Headline
                    style={{ opacity: 0.35 }}
                    onPress={() => setRequestSent(true)}
                  >
                  Friend
                  </Headline>
                </View>
              ))}
        </View>
        {displayHandle && <Caption>{userHandle}</Caption>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toastStyle: {
    borderRadius: 12,
    flex: 1,
    width: "90%",
    backgroundColor: AppStyles.darkColor,
    alignItems: "flex-start"
  },
  textStyle: {
    color: "white",
    textAlignVertical: "center",
    paddingTop: 4
  },
  iconStyle: {
    marginRight: 16,
    paddingTop: 4
  },
  containerStyle: {
    flexDirection: "row",
    alignItems: "center"
  }
})

export default ProfileImageAndName
