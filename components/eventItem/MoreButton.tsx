import React from "react"
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
        <MenuTrigger testID="more options">
          <MaterialIcons name="more-horiz" size={24} />
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          {/* Need to use Text in order for tests to find the element */}
          {eventHost
            ? (
              <MenuOption onSelect={alertDelete} customStyles={deleteStyle}>
                <Text>Delete</Text>
              </MenuOption>
            )
            : (
              <MenuOption onSelect={alertReport}>
                <Text>Report</Text>
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

const deleteStyle = StyleSheet.create({
  optionText: {
    // textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
    color: "red"
  }
})

export default MoreButton
