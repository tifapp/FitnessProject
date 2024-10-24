import { AppStyles } from "@lib/AppColorStyle"
import { ReactNode } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"

export type TiFFormCardProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const TiFFormCardView = ({ children, style }: TiFFormCardProps) => (
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
