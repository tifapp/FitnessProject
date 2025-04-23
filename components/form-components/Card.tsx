import { ReactNode } from "react"
import { StyleProp, View, ViewStyle } from "react-native"

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
    <View style={{ borderRadius }}>{children}</View>
  </View>
)
