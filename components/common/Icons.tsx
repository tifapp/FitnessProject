import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons"
import { useFontScale } from "@hooks/Fonts"
import React, { ComponentProps } from "react"
import {
  StyleProp,
  TouchableOpacityProps,
  TouchableOpacity,
  ViewProps,
  ViewStyle
} from "react-native"

/**
 * A base type for icon props.
 */
export type IconProps<IconName extends string> = {
  name: IconName
  size?: number
  maximumFontScaleFactor?: number
  style?: StyleProp<ViewStyle>
  color?: string
} & ViewProps

export type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"]

/**
 * A Material icon component that automatically adjusts with the user's font settings.
 */
export const MaterialIcon = ({
  name,
  size = 24,
  style,
  color,
  maximumFontScaleFactor,
  ...props
}: IconProps<MaterialIconName>) => (
  <MaterialIcons
    name={name}
    size={size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })}
    color={color}
    style={style}
    {...props}
  />
)

export type MaterialCommunityIconName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"]

/**
 * A Material Community icon component that automatically adjusts with the user's font settings.
 */
export const MaterialCommunityIcon = ({
  name,
  size = 24,
  style,
  color,
  maximumFontScaleFactor,
  ...props
}: IconProps<MaterialCommunityIconName>) => (
  <MaterialCommunityIcons
    name={name}
    size={size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })}
    color={color}
    style={style}
    {...props}
  />
)

export type IoniconName = ComponentProps<typeof Ionicons>["name"]

/**
 * An icon component for Ionicons.
 */
export const Ionicon = ({
  name,
  size = 24,
  style,
  color,
  maximumFontScaleFactor,
  ...props
}: IconProps<IoniconName>) => (
  <Ionicons
    name={name}
    size={size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })}
    color={color}
    style={style}
    {...props}
  />
)

export type IoniconButtonProps = {
  icon: IconProps<IoniconName>
} & TouchableOpacityProps

/**
 * An ionicon with no background that behaves like {@link TouchableOpacity}.
 */
export const TouchableIonicon = ({ icon, ...props }: IoniconButtonProps) => (
  <TouchableOpacity
    {...props}
    hitSlop={{ left: 16, right: 16, top: 16, bottom: 16 }}
  >
    <Ionicon {...icon} />
  </TouchableOpacity>
)
