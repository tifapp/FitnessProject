import { AppStyles } from "@lib/AppColorStyle"
import { ReactNode } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"

export type TiFFormCardProps = {
  children?: ReactNode
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export const TiFFormCardView = ({
  children,
  borderRadius = 12,
  style
}: TiFFormCardProps) => (
  <View style={style}>
    <View style={[styles.container, { borderRadius }]}>{children}</View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.eventCardColor,
    overflow: "hidden"
  }
})
