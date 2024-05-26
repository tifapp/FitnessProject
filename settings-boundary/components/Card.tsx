import { AppStyles } from "@lib/AppColorStyle"
import { ReactNode } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"

export type SettingsCardProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsCardView = ({ children, style }: SettingsCardProps) => (
  <View style={style}>
    <View style={styles.container}>{children}</View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.eventCardColor,
    overflow: "hidden",
    borderRadius: 12
  }
})
