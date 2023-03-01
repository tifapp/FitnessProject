import React from "react"
import { HexColor } from "@lib/Color"
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useDependencyValue } from "../../lib/dependencies"
import { HapticEvent, hapticsDependencyKey } from "../../lib/Haptics"

/**
 * The default function for creating an accessibility label
 * for a `HexColorPicker` option.
 */
export const defaultCreateAccessibilityLabel = (color: HexColor) => {
  return `Color ${color}`
}

/**
 * Props for a `HexColorPicker`.
 */
export type HexColorPickerProps = {
  /**
   * The current color that is selected in the picker.
   */
  color: HexColor

  /**
   * Acts upon the color changing in the picker.
   */
  onChange: (color: HexColor) => void

  /**
   * The available options in the picker.
   */
  options: HexColor[]

  /**
   * The container style of the picker.
   */
  style?: StyleProp<ViewStyle>

  /**
   * A function to create an accessibility label for a color option.
   *
   * The default simply returns a string in the following format:
   *
   * "Color {hex color}"
   */
  createAccessibilityLabel?: (color: HexColor) => string
}

/**
 * A color picker which uses hex colors.
 */
const HexColorPicker = ({
  color,
  onChange,
  options,
  style,
  createAccessibilityLabel = defaultCreateAccessibilityLabel
}: HexColorPickerProps) => {
  const playHaptics = useDependencyValue(hapticsDependencyKey)

  const colorTapped = (option: HexColor) => {
    if (Platform.OS === "ios") playHaptics(HapticEvent.SelectionChanged)
    onChange(option)
  }

  return (
    <View style={[styles.wrappedContainer, style]}>
      {options.map((option) => (
        <TouchableOpacity
          style={styles.optionContainer}
          key={option}
          onPress={() => colorTapped(option)}
          accessibilityLabel={createAccessibilityLabel(option)}
        >
          <View
            style={{
              backgroundColor: option,
              borderRadius: 32,
              padding: 12
            }}
          >
            <MaterialIcons
              name="check"
              color="white"
              size={24}
              style={{ opacity: color === option ? 1 : 0 }}
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
    marginHorizontal: 12,
    marginBottom: 12
  }
})

export default HexColorPicker
