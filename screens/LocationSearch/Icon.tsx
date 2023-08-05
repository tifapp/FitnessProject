import React from "react"
import { Ionicon, IoniconName } from "@components/common/Icons"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  Platform,
  AccessibilityProps
} from "react-native"

export type LocationSearchIconProps = {
  backgroundColor: string
  name: IoniconName
  style?: StyleProp<ViewStyle>
} & AccessibilityProps

/**
 * The icon next to each search result in the location search feature.
 */
export const LocationSearchIconView = ({
  backgroundColor,
  name,
  style,
  ...accessibilityProps
}: LocationSearchIconProps) => {
  const borderStyle = { backgroundColor, borderRadius: 32 }
  // NB: iOS needs to put the border in a container view in order to get the border radius, but this
  // breaks android which we apply the border style directly to the icon on android...
  return (
    <View style={[style, Platform.OS === "ios" ? borderStyle : undefined]}>
      <Ionicon
        {...accessibilityProps}
        name={name}
        size={16}
        style={[
          styles.iconStyle,
          Platform.OS === "android" ? borderStyle : undefined
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  iconStyle: {
    color: "white",
    padding: 8
  }
})
