import React, { ComponentProps } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

export type SearchBarProps = {
  text: string
  onTextChanged: (text: string) => void
  icon?: ComponentProps<typeof MaterialIcons>["name"]
  placeholder?: string
  onIconTapped?: () => void
  iconAccessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

const SearchBar = ({
  icon,
  text,
  onTextChanged,
  placeholder,
  iconAccessibilityLabel,
  onIconTapped,
  style
}: SearchBarProps) => (
  <View style={style}>
    {icon && (
      <TouchableOpacity
        onPress={() => onIconTapped?.()}
        accessibilityLabel={iconAccessibilityLabel}
      >
        <MaterialIcons name={icon} size={24} />
      </TouchableOpacity>
    )}
    <TextInput
      placeholder={placeholder}
      value={text}
      onChangeText={onTextChanged}
    />
  </View>
)

export default SearchBar
