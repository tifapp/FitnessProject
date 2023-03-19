import React, { ReactNode } from "react"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { MaterialCommunityIcon } from "./common/Icons"

export type SearchBarProps = {
  text: string
  onTextChanged: (text: string) => void
  leftAddon?: ReactNode
  placeholder?: string
  style?: StyleProp<ViewStyle>
}

export const SearchBar = ({
  leftAddon,
  text,
  onTextChanged,
  placeholder,
  style
}: SearchBarProps) => (
  <View style={style}>
    {leftAddon}
    <TextInput
      placeholder={placeholder}
      value={text}
      onChangeText={onTextChanged}
    />
    {text.length > 0 && (
      <TouchableOpacity
        onPress={() => onTextChanged("")}
        accessibilityLabel="Clear all search text"
      >
        <MaterialCommunityIcon name="close-circle-outline" size={24} />
      </TouchableOpacity>
    )}
  </View>
)
