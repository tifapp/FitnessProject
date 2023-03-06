import React, { ComponentProps } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { MaterialIconName } from "@lib/MaterialIcon"

export type SearchBarProps = {
  text: string
  onTextChanged: (text: string) => void
  icon?: {
    name: MaterialIconName
    onTapped?: () => void
    accessibilityLabel?: string
  }
  placeholder?: string
  style?: StyleProp<ViewStyle>
}

const SearchBar = ({
  icon,
  text,
  onTextChanged,
  placeholder,
  style
}: SearchBarProps) => (
  <View style={style}>
    {icon && (
      <TouchableOpacity
        onPress={() => icon.onTapped?.()}
        accessibilityLabel={icon.accessibilityLabel}
      >
        <MaterialIcons name={icon.name} size={24} />
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
