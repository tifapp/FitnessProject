import Toast from "react-native-root-toast"
import { AppStyles } from "../../lib/AppColorStyle"
import { StyleSheet, View } from "react-native"
import { Ionicon } from "./Icons"
import { BodyText } from "@components/Text"
import { UserFriendStatus } from "@components/profileImageComponents/ProfileImageAndNameWithFriend"

export const showToast = (message: string, bottomOffset: number) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM - bottomOffset,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 100,
    textStyle: { fontSize: 16, fontFamily: "OpenSans" },
    textColor: "white",
    backgroundColor: AppStyles.darkColor,
    opacity: 1,
    containerStyle: { borderRadius: 12 }
  })
}

interface ToastProps {
  requestSent: boolean
  setRequestSent: React.Dispatch<React.SetStateAction<boolean>>
  friendStatus: UserFriendStatus
  offset: number
}

export const FriendToast = ({
  requestSent,
  setRequestSent,
  friendStatus,
  offset
}: ToastProps) => {
  return (
    <>
      {!requestSent && (
        <Toast
          visible={friendStatus === "friend-request-pending"}
          opacity={1}
          position={Toast.positions.BOTTOM - offset}
          shadow={false}
          animation={true}
          hideOnPress={true}
          containerStyle={styles.toastStyle}
          onHide={() => setRequestSent(true)}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 16 }}>
              <Ionicon color="white" name="close" />
            </View>
            <BodyText style={{ color: "white", textAlignVertical: "center" }}>
              {"Friend request sent"}
            </BodyText>
          </View>
        </Toast>
      )}
    </>
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
