import React, { useState } from "react"
import { StyleSheet, View, Alert, Text } from "react-native"
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

// Uses Popup menu. In order to test clicking on a Menu Option, the onPress option must be passed to the child since there is an issue with testID not being available on Menu Option */
const MoreButton = ({ eventHost }: Props) => {
  const [isOpen, setOpen] = useState(false)
  let dismiss: () => void

  const alertDelete = () => {
    setOpen(false)
    Alert.alert("Delete this event?", undefined, [
      { text: "Delete", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const alertReport = () => {
    setOpen(false)
    Alert.alert("Report this event?", undefined, [
      { text: "Report", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  return (
    <View style={styles.moreButtonStyle}>
      <Menu opened={isOpen}>
        <MenuTrigger
          testID="more options"
          onPress={() => {
            setOpen(true)
          }}
        >
          <MaterialIcons name="more-horiz" size={24} />
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          {/* Need to use Text in order for tests to find the element */}
          {eventHost
            ? (
              <MenuOption>
                <Text style={styles.deleteStyle} onPress={alertDelete}>
                Delete
                </Text>
              </MenuOption>
            )
            : (
              <MenuOption>
                <Text onPress={alertReport}>Report</Text>
              </MenuOption>
            )}
          {/* <MenuOption onSelect={alertDelete} text="Delete" />
          <MenuOption onSelect={alertDelete} text="Delete" />
            <MenuOption onSelect={alertDelete} text="Delete" /> */}
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
  },
  deleteStyle: {
    textAlignVertical: "center",
    fontSize: 16,
    color: "red"
  }
})

const optionsStyles = StyleSheet.create({
  optionsContainer: {
    width: "30%"
  },
  optionText: {
    // textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16
  }
})

export default MoreButton
