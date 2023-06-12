import React from "react"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useAtomValue } from "jotai"
import { Alert, StyleSheet } from "react-native"
import { hasEditedProfileAtom } from "../state"

type EditProfileDismissButtonProps = {
  onDismiss: () => void
}

export const EditProfileDismissButton = ({
  onDismiss
}: EditProfileDismissButtonProps) => {
  const hasEdited = useAtomValue(hasEditedProfileAtom)

  const backButtonTapped = () => {
    if (hasEdited) {
      Alert.alert(
        "Discard Edits?",
        "Changes to your profile will not be saved.",
        [
          { text: "Discard", style: "destructive", onPress: onDismiss },
          { text: "Keep Editing" }
        ]
      )
    } else {
      onDismiss()
    }
  }

  return (
    <TouchableIonicon
      icon={{ name: "close", color: AppStyles.darkColor }}
      style={styles.leftSpacing}
      onPress={backButtonTapped}
    />
  )
}

const styles = StyleSheet.create({
  leftSpacing: {
    paddingLeft: 16
  }
})
