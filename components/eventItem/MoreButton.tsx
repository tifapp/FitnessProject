import IconButton from "@components/common/IconButton"
import React, { createContext, useContext } from "react"
import { StyleSheet, View, Alert } from "react-native"

const MoreButton = () => {
  const { dismiss } = useMoreButtonContext()

  const alertUser = () => {
    Alert.alert("Delete this event?", undefined, [
      { text: "Delete", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  return (
    <View style={styles.moreButtonStyle}>
      <IconButton iconName={"more-horiz"} size={26} onPress={alertUser} />
    </View>
  )
}

const styles = StyleSheet.create({
  moreButtonStyle: {
    flex: 1,
    opacity: 0.4,
    alignItems: "flex-end"
  }
})

export const useMoreButtonContext = () => {
  const context = useContext(MoreButtonContext)
  return { ...context }
}

export type MoreButtonContextValues = {
  /**
   * Closes the popup alert
   */
  dismiss: () => void
}

const MoreButtonContext = createContext<MoreButtonContextValues | undefined>(
  undefined
)

export default MoreButton
