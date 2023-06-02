import React from "react"
import { useAtomValue } from "jotai"
import { userAtom } from "../state"
import { ChevronBackButton } from "@components/Navigation"
import { StyleSheet, View } from "react-native"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import { TouchableIonicon } from "@components/common/Icons"

type HeaderRightProfileProps = {
  onPressSettings: () => void
  onPressEditProfile: () => void
}

export const HeaderLeftProfile = () => {
  const user = useAtomValue(userAtom)

  return user?.relationStatus !== "current-user" ? <ChevronBackButton /> : null
}

export const HeaderRightProfile = ({
  onPressSettings,
  onPressEditProfile
}: HeaderRightProfileProps) => {
  const user = useAtomValue(userAtom)

  return user?.relationStatus === "current-user"
    ? (
      <View style={{ flexDirection: "row" }}>
        <TouchableIonicon
          icon={{ name: "create", style: styles.rightSpacing }}
          onPress={onPressEditProfile}
        />
        <TouchableIonicon
          icon={{ name: "settings", style: styles.rightSpacing }}
          onPress={onPressSettings}
        />
      </View>
    )
    : (
      <ConfirmationDialogue style={styles.rightSpacing} />
    )
}

const styles = StyleSheet.create({
  rightSpacing: {
    paddingRight: 18
  }
})
