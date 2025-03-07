import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type TiFFormCardProps = {
  children?: ReactNode
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export const TiFFormCardView = ({
  children,
  borderRadius = 32,
  style
}: TiFFormCardProps) => (
  <View style={style}>
    <View style={[styles.container, { borderRadius }]}>{children}</View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    // borderWidth: 2,
    // borderColor: AppStyles.cardColor,
    // backgroundColor: "white",
    // overflow: "hidden"
  }
})
