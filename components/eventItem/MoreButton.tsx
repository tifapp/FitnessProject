import React from "react"
import { StyleSheet, View, Alert } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu"

interface Props {
  eventHost: boolean
}

const MoreButton = ({ eventHost }: Props) => {
  let dismiss: () => void

  const alertDelete = () => {
    Alert.alert("Delete this event?", undefined, [
      { text: "Delete", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const alertReport = () => {
    Alert.alert("Report this event?", undefined, [
      { text: "Report", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  return (
    <View style={styles.moreButtonStyle}>
      <Menu>
        <MenuTrigger>
          <MaterialIcons name="more-horiz" size={24} />
        </MenuTrigger>
        <MenuOptions>
          {eventHost
            ? (
              <MenuOption onSelect={alertDelete} text="Delete" />
            )
            : (
              <MenuOption onSelect={alertReport} text="Report" />
            )}
        </MenuOptions>
      </Menu>
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

export default MoreButton
