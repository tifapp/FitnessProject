import { Ionicons } from "@expo/vector-icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import React, { ComponentProps } from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
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
  size?: number
} & Omit<IconProps<IoniconName>, "size">

/**
 * An ionicon with a circular colored background.
 */
export const CircularIonicon = ({
  backgroundColor,
  maximumFontScaleFactor,
  name,
  style,
  size = DEFAULT_ICON_SIZE,
  ...props
}: CircularIoniconProps) => (
  <View style={style}>
    <View style={circularStyles.iconContainer}>
      <View
        style={[
          circularStyles.iconBackground,
          {
            backgroundColor,
            width:
              size *
              useFontScale({
                maximumScaleFactor: maximumFontScaleFactor
              }) *
              1.5,
            height:
              size *
              useFontScale({
                maximumScaleFactor: maximumFontScaleFactor
              }) *
              1.5
          }
        ]}
      />
      <Ionicon
        {...props}
        name={name}
        size={(size * 1.5) / 2}
        color="white"
        style={circularStyles.icon}
      />
    </View>
  </View>
)

const circularStyles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    position: "absolute",
    alignSelf: "center"
  },
  iconBackground: {
    borderRadius: 128
  }
})

export type RoundedIoniconProps = Omit<CircularIoniconProps, "size"> & {
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
  size = 20,
  ...props
}: IoniconCloseButtonProps) => (
  <TouchableOpacity {...props} onPress={onPress}>
    <RoundedIonicon
      {...props}
      name="close"
      size={size}
      borderRadius={32}
      backgroundColor={AppStyles.cardColor}
    />
  </TouchableOpacity>
)
