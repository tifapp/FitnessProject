// React Native Bottom Action Menu
// https://aboutreact.com/react-native-bottom-action-menu/

// import React in our code
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useRef } from "react"

// import all the components we are going to use
import { StyleProp, View, ViewStyle } from "react-native"

// import ActionSheet
import ActionSheet from "react-native-actionsheet"

interface Props {
  style?: StyleProp<ViewStyle>
}

const ConfirmationDialogue = ({ style }: Props) => {
  const actionSheet = useRef<ActionSheet>(null)
  const optionArray = ["Block User", "Report User", "Cancel"]

  const showActionSheet = () => {
    // To show the Bottom ActionSheet
    actionSheet.current.show()
  }

  return (
    <View style={style}>
      <TouchableIonicon
        icon={{
          name: "ellipsis-horizontal",
          color: AppStyles.darkColor
        }}
        onPress={showActionSheet}
      />
      <ActionSheet
        ref={actionSheet}
        title={"Options"}
        options={optionArray}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={(index) => {
          // Clicking on the option will give you alert
          console.log(index)
        }}
      />
    </View>
  )
}
export default ConfirmationDialogue
