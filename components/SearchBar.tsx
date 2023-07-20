import React, { ReactNode } from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import { TouchableIonicon } from "./common/Icons"
import { TextField } from "./TextFields"

export type SearchBarProps = {
  text: string
  onTextChanged: (text: string) => void
  leftAddon?: ReactNode
  placeholder?: string
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
  style
}: SearchBarProps) => (
  <TextField
    containerStyle={style}
    value={text}
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
