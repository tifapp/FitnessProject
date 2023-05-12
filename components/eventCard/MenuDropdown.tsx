import React, { useState } from "react"
import {
  Alert,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native"
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"

interface Props {
  isEventHost: boolean
  style?: StyleProp<ViewStyle>
}

const MenuDropdown = ({ isEventHost, style }: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  let dismiss: () => void

  const alertDelete = () => {
    dismissMenu()
    Alert.alert("Delete this event?", undefined, [
      { text: "Delete", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel", onPress: dismiss }
    ])
  }

  // Will probably need to use a modal instead to have user select/type in reason for report
  const alertReport = () => {
    dismissMenu()
    Alert.alert("Report this event?", undefined, [
      { text: "Report", style: "destructive", onPress: dismiss },
      { text: "Cancel", style: "cancel" }
    ])
  }

  const dismissMenu = () => {
    setMenuOpen(false)
  }

  const editForm = () => {
    console.log("call event form")
  }

  return (
    <View style={style}>
      <Menu opened={isMenuOpen} onBackdropPress={() => setMenuOpen(false)}>
        <MenuTrigger
          testID="more options"
          onPress={() => setMenuOpen(true)}
          customStyles={{
            TriggerTouchableComponent: TouchableOpacity
          }}
        >
          <Ionicon color={AppStyles.darkColor} name="ellipsis-horizontal" />
        </MenuTrigger>
        {/* Need to use Text in order for tests to find the element
                Also need to move the onSelect functions to child in order to test functionality
                */}
        {isEventHost
          ? (
            <MenuOptions customStyles={menuOptionsStyles}>
              <MenuOption>
                <Text style={{ color: "red" }} onPress={alertDelete}>
                Delete
                </Text>
              </MenuOption>
              <MenuOption>
                <Text onPress={editForm}>Edit</Text>
              </MenuOption>
            </MenuOptions>
          )
          : (
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  width: "30%"
                }
              }}
            >
              <MenuOption>
                <Text onPress={alertReport}>Report</Text>
              </MenuOption>
            </MenuOptions>
          )}
      </Menu>
    </View>
  )
}

const styles = StyleSheet.create({
  optionsText: {
    textAlignVertical: "center",
    fontSize: 16
  },
  optionsContainer: {
    width: "30%"
  }
})

const menuOptionsStyles = {
  optionsContainer: styles.optionsContainer,
  optionsText: styles.optionsText
}
export default MenuDropdown
