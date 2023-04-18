import React, { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type WithScreenEdgePaddingProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const WithScreenEdgePadding = ({
  children,
  style
}: WithScreenEdgePaddingProps) => (
  <View style={[style, styles.screenEdgePadding]}>{children}</View>
)

const styles = StyleSheet.create({
  screenEdgePadding: {
    paddingHorizontal: 16
  }
})
