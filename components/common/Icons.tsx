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
import Svg, { Path } from "react-native-svg"

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
  color,
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
        color={color}
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

export type PlusIconProps = {
  size?: number
  maxmimumFontScaleFactor?: number
  style?: StyleProp<ViewStyle>
}

export const PlusIconView = ({
  size = 24,
  maxmimumFontScaleFactor,
  style
}: PlusIconProps) => {
  const fontScale = useFontScale({
    maximumScaleFactor: maxmimumFontScaleFactor
  })
  return (
    <View accessible={false} style={style}>
      <View style={styles.plusContainer}>
        <View
          style={{
            width: size * fontScale,
            height: 2 * fontScale,
            alignSelf: "center",
            borderRadius: 12,
            backgroundColor: "white"
          }}
        />
        <View
          style={{
            position: "absolute",
            top: (-size * fontScale) / 2 + fontScale,
            alignSelf: "center",
            width: 2 * fontScale,
            height: size * fontScale,
            borderRadius: 12,
            backgroundColor: "white"
          }}
        />
      </View>
    </View>
  )
}

export const BalloonIcon = ({
  width = 48,
  height = 48,
  color = AppStyles.colorOpacity10
}: {
  width: number
  height: number
  color: string
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100">
      <Path
        d="M62.352,69.572c7.372-12.111,15.308-27.046,15.308-35.23c0-15.276-12.384-27.66-27.66-27.66  c-15.276,0-27.66,12.384-27.66,27.66c0,8.184,7.937,23.119,15.308,35.23c-0.551,0.337-0.922,0.939-0.922,1.633  c0,1.06,0.859,1.919,1.919,1.919h2.924c0.462,1.424,0.933,2.834,1.398,4.219c0.691,2.06,1.39,4.161,2.049,6.284h-1.288  c-0.471,0-0.853,0.382-0.853,0.853c0,0.471,0.382,0.853,0.853,0.853h0.178l1.666,7.986h8.854l1.666-7.986h0.178  c0.471,0,0.853-0.382,0.853-0.853c0-0.471-0.382-0.853-0.853-0.853h-0.957c0.486-1.582,0.992-3.148,1.49-4.688  c0.617-1.907,1.241-3.853,1.826-5.815h2.724c1.06,0,1.919-0.859,1.919-1.919C63.273,70.511,62.903,69.909,62.352,69.572z   M55.587,78.545c-0.539,1.666-1.086,3.364-1.609,5.081h-7.624c-0.696-2.264-1.439-4.501-2.174-6.691  c-0.42-1.252-0.844-2.529-1.263-3.812h14.38C56.747,74.95,56.163,76.764,55.587,78.545z"
        fill={color}
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  plusContainer: {
    position: "relative"
  }
})
