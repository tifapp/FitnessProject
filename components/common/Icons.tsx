import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons"
import { useFontScale } from "@lib/Fonts"
import React, { ComponentProps } from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacityProps,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
  Platform,
  View
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

export const DEFAULT_ICON_SIZE = 24

export type IoniconName = ComponentProps<typeof Ionicons>["name"]

/**
 * An icon component for Ionicons.
 */
export const Ionicon = ({
  name,
  size = DEFAULT_ICON_SIZE,
  style,
  color,
  maximumFontScaleFactor,
  ...props
}: IconProps<IoniconName>) => (
  <Ionicons
    name={name}
    size={size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })}
    color={color}
    style={[
      style,
      {
        height:
          size * useFontScale({ maximumScaleFactor: maximumFontScaleFactor })
      }
    ]}
    {...props}
  />
)

export type IoniconButtonProps = {
  icon: IconProps<IoniconName>
} & TouchableOpacityProps

/**
 * An ionicon with no background that behaves like {@link TouchableOpacity}.
 */
export const TouchableIonicon = ({
  icon,
  style,
  ...props
}: IoniconButtonProps) => (
  <TouchableOpacity
    {...props}
    hitSlop={{ left: 16, right: 16, top: 16, bottom: 16 }}
    style={[
      style,
      {
        height:
          (icon.size ?? DEFAULT_ICON_SIZE) *
          useFontScale({ maximumScaleFactor: icon.maximumFontScaleFactor })
      }
    ]}
  >
    <Ionicon {...icon} />
  </TouchableOpacity>
)

export type CircularIoniconProps = {
  backgroundColor: string
  name: IoniconName
  style?: StyleProp<ViewStyle>
} & IconProps<IoniconName>

/**
 * An ionicon with a circular colored background.
 */
export const CircularIonicon = ({
  backgroundColor,
  name,
  style,
  ...props
}: CircularIoniconProps) => {
  const borderStyle = { backgroundColor, borderRadius: 32 }
  // NB: iOS needs to put the border in a container view in order to get the border radius, but this
  // breaks android which we apply the border style directly to the icon on android...
  return (
    <View style={[style, Platform.OS === "ios" ? borderStyle : undefined]}>
      <Ionicon
        {...props}
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
