import React, { ReactNode } from "react"
import {
  StyleProp,
  TextInput,
  View,
  ViewStyle,
  TouchableOpacity,
  StyleSheet
} from "react-native"
import { IoniconTouchableOpacity, MaterialCommunityIcon } from "./common/Icons"

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
  <View style={style}>
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.leftAddon}>{leftAddon}</View>
        <View style={styles.leftContainer}>
          <TextInput
            placeholder={placeholder}
            value={text}
            onChangeText={onTextChanged}
            style={styles.textInput}
          />
        </View>
        {text.length > 0 && (
          <IoniconTouchableOpacity
            icon={{
              name: "close"
            }}
            style={styles.clearIconContainer}
            onPress={() => onTextChanged("")}
            accessibilityLabel="Clear all search text"
          />
        )}
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "rgba(0, 0, 0, 0.10)"
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 8
  },
  leftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  leftAddon: {
    marginRight: 8
  },
  textInput: {
    fontSize: 16,
    fontFamily: "OpenSans",
    width: "100%"
  },
  clearIconContainer: {
    marginLeft: 8
  },
  clearIcon: {
    color: "black",
    padding: 4,
    opacity: 0.35
  }
})
