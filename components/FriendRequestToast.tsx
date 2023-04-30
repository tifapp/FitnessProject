import { ButtonStyles } from "@lib/ButtonStyle"
import { StyleSheet, View } from "react-native"
import Toast from "react-native-root-toast"
import { requestAtom } from "@lib/Jotai"
import { Ionicon } from "./common/Icons"
import { BodyText } from "./Text"
import { useAtomValue } from "jotai"


interface FriendRequestToastProps {
  bottomOffset: number
}

const FriendRequestToast = ({bottomOffset}: FriendRequestToastProps) => {
  const requestSent = useAtomValue(requestAtom)

  return (
    <Toast
        visible={requestSent}
        opacity={1}
        position={Toast.positions.BOTTOM - bottomOffset}
        shadow={false}
        animation={true}
        hideOnPress={true}
        containerStyle={styles.toastStyle}
      >
        <View style={{flexDirection: "row"}}>
          <View style={{marginRight: 16}}>
            <Ionicon color="white" name="close"/>
          </View>
          <BodyText style={{color: "white", textAlignVertical: "center"}}>
            {"Friend request sent"}
          </BodyText>
        </View>
      </Toast>
  )
}

const styles = StyleSheet.create({
  toastStyle: {
    borderRadius: 12,
    width: '90%',
    backgroundColor: ButtonStyles.darkColor,
    alignItems: "flex-start"
  }
})

export default FriendRequestToast