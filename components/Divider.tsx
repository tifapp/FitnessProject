import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, View, ViewStyle } from "react-native"

export type DividerProps = {
  lineThickness?: number
  direction?: "vertical" | "horizontal"
  color?: ColorString
  style?: StyleProp<ViewStyle>
}

export const DividerView = ({
  lineThickness = 1,
  direction = "horizontal",
  color = AppStyles.veryLightGrey,
  style
}: DividerProps) => (
  <View
    style={[
      style,
      {
        backgroundColor: color.toString(),
        width: direction === "vertical" ? lineThickness : undefined,
        height: direction === "horizontal" ? lineThickness : undefined
      }
    ]}
  />
)
