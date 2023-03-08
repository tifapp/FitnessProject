import { MaterialIcons } from "@expo/vector-icons"
import { useFontScale } from "@lib/FontScale"
import React, { ComponentProps } from "react"
import { StyleProp, ViewProps, ViewStyle } from "react-native"

export type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"]

export type MaterialIconProps = {
  name: MaterialIconName
  size?: number
  maximumFontScaleFactor?: number
  style?: StyleProp<ViewStyle>
  color?: string
} & ViewProps

/**
 * An icon component that automatically adjusts with the user's font settings.
 */
export const MaterialIcon = ({
  name,
  size = 24,
  style,
  color,
  maximumFontScaleFactor,
  ...props
}: MaterialIconProps) => (
  <MaterialIcons
    name={name}
    size={size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })}
    color={color}
    style={style}
    {...props}
  />
)
