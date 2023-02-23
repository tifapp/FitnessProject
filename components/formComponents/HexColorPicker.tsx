import React from "react"
import { HexColor } from "@lib/Color"
import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useDependencyValue } from "../../lib/dependencies"
import { HapticEvent, hapticsDependencyKey } from "@lib/Haptics"

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

  /**
   * Renders colors in a grid rather than a horizontal scroll view.
   */
  grid?: boolean
}

/**
 * A color picker which uses hex colors.
 */
const HexColorPicker = ({
  color,
  onChange,
  options,
  style,
  grid = false,
  createAccessibilityLabel = defaultCreateAccessibilityLabel
}: HexColorPickerProps) => {
  const playHaptics = useDependencyValue(hapticsDependencyKey)

  const colorTapped = (option: HexColor) => {
    if (Platform.OS === "ios") playHaptics(HapticEvent.SelectionChanged)
    onChange(option)
  }

  return (
    <ScrollView
      scrollEnabled={!grid}
      horizontal
      contentContainerStyle={[
        grid ? styles.wrappedContainer : styles.container,
        style
      ]}
    >
      {options.map((option) => (
        <TouchableOpacity
          style={styles.optionContainer}
          key={option}
          onPress={() => colorTapped(option)}
          accessibilityRole="button"
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  wrappedContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap"
  },
  optionContainer: {
    marginRight: 12,
    marginBottom: 12
  },
  selectionIcon: {
    position: "absolute"
  }
})

export default HexColorPicker
