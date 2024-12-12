import React from "react"
import { StyleProp, ViewStyle, StyleSheet, TextStyle } from "react-native"
import { TouchableIonicon } from "./common/Icons"
import { TextField } from "./TextFields"

export type SearchBarProps = {
  text: string
  onTextChanged: (text: string) => void
  leftAddon?: JSX.Element
  placeholder?: string
  textStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
}

/**
 * A generic search bar component.
 */
export const SearchBar = ({
  leftAddon,
  text,
  onTextChanged,
  placeholder,
  style,
  textStyle
}: SearchBarProps) => (
  <TextField
    style={style}
    value={text}
    textStyle={textStyle}
    onChangeText={onTextChanged}
    leftAddon={leftAddon}
    placeholder={placeholder}
    rightAddon={
      <>
        {text.length > 0 && (
          <TouchableIonicon
            icon={{
              name: "close"
            }}
            style={styles.clearIconContainer}
            onPress={() => onTextChanged("")}
            accessibilityLabel="Clear all search text"
          />
        )}
      </>
    }
  />
)

const styles = StyleSheet.create({
  clearIconContainer: {
    marginLeft: 8
  }
})
