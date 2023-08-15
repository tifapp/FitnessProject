import { MaterialIcons } from "@expo/vector-icons"
import { HexColor } from "@lib/Color"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import { useHaptics } from "../../lib/Haptics"

export type HexColorPickerOption<T extends HexColor = HexColor> = {
  color: T
  accessibilityLabel: string
}

/**
 * Props for a `HexColorPicker`.
 */
export type HexColorPickerProps<T extends HexColor = HexColor> = {
  /**
   * The current color that is selected in the picker.
   */
  color: HexColor

  /**
   * Acts upon the color changing in the picker.
   */
  onChange: (color: T) => void

  /**
   * The available options in the picker.
   */
  options: HexColorPickerOption<T>[]

  /**
   * The container style of the picker.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * A color picker which uses hex colors.
 */
const HexColorPicker = <T extends HexColor = HexColor>({
  color,
  onChange,
  options,
  style
}: HexColorPickerProps<T>) => {
  const haptics = useHaptics()

  const colorTapped = (option: T) => {
    haptics.play({ name: "selection" })
    onChange(option)
  }

  return (
    <View style={[styles.wrappedContainer, style]}>
      {options.map((option) => (
        <TouchableOpacity
          style={styles.optionContainer}
          key={option.color}
          onPress={() => colorTapped(option.color)}
          accessibilityLabel={option.accessibilityLabel}
        >
          <View
            style={{
              ...styles.option,
              backgroundColor: option.color
            }}
          >
            <MaterialIcons
              name="check"
              color="white"
              size={24}
              style={{ opacity: color === option.color ? 1 : 0 }}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrappedContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap"
  },
  optionContainer: {
    width: "20%",
    marginBottom: 12,
    display: "flex"
  },
  option: {
    width: 44,
    height: 44,
    borderRadius: 32,
    padding: 12,
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
})

export default HexColorPicker
