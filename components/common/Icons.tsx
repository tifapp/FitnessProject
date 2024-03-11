import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import React, { ComponentProps } from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacityProps,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
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
} & Omit<IconProps<IoniconName>, "size">

/**
 * An ionicon with a circular colored background.
 */
export const CircularIonicon = ({
  backgroundColor,
  name,
  style,
  ...props
}: CircularIoniconProps) => (
  <View style={circularStyles.iconContainer}>
    <View
      style={[
        circularStyles.iconBackground,
        {
          backgroundColor,
          width: DEFAULT_ICON_SIZE * 1.5,
          height: DEFAULT_ICON_SIZE * 1.5
        }
      ]}
    />
    <Ionicon
      {...props}
      name={name}
      size={DEFAULT_ICON_SIZE * (2 / 3)}
      color="white"
      style={[
        circularStyles.icon,
        { bottom: DEFAULT_ICON_SIZE / 2 - 1, right: DEFAULT_ICON_SIZE / 2 - 2 }
      ]}
    />
  </View>
)

const circularStyles = StyleSheet.create({
  iconContainer: {
    position: "relative"
  },
  icon: {
    position: "absolute"
  },
  iconBackground: {
    borderRadius: 32
  }
})

export type RoundedIoniconProps = CircularIoniconProps & {
  borderRadius: number
  size?: number
}

/**
 * An ionicon wrapped in a rounded square with a border radius.
 */
export const RoundedIonicon = ({
  backgroundColor,
  borderRadius,
  name,
  size = DEFAULT_ICON_SIZE,
  maximumFontScaleFactor,
  style,
  ...props
}: RoundedIoniconProps) => {
  const fontScale = useFontScale({
    maximumScaleFactor: maximumFontScaleFactor
  })
  return (
    <View style={{ borderRadius, backgroundColor }}>
      <View style={{ padding: size * fontScale * (1 / 3) }}>
        <Ionicon
          {...props}
          name={name}
          size={size * fontScale}
          maximumFontScaleFactor={maximumFontScaleFactor}
          color={props.color}
        />
      </View>
    </View>
  )
}

export type IoniconCloseButtonProps = Omit<IconProps<"close">, "name"> &
  TouchableOpacityProps

/**
 * A close button that uses the "close" Ionicon.
 */
export const IoniconCloseButton = ({
  onPress,
  ...props
}: IoniconCloseButtonProps) => (
  <TouchableOpacity {...props} onPress={onPress}>
    <RoundedIonicon
      {...props}
      name="close"
      borderRadius={32}
      backgroundColor={AppStyles.eventCardColor}
    />
  </TouchableOpacity>
)
