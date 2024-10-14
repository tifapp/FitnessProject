import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import React, { ReactNode } from "react"
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle
} from "react-native"

type ContentStyle<Children extends ReactNode> = Children extends string | number
  ? { contentStyle?: StyleProp<TextStyle> }
  : { contentStyle?: StyleProp<ViewStyle> }

export type LegacyButtonProps = {
  /**
   * @deprecated Use `children` to render just text instead.
   */
  title: string
  contentStyle?: StyleProp<TextStyle>
} & Omit<TouchableOpacityProps, "children">

/**
 * Props for a button.
 *
 * If you just want a text button, you can either pass in a `title` prop or use `children`.
 * In this case, always use the `children` prop as `title` is only kept around for legacy reasons.
 */
export type ButtonProps<Children extends ReactNode> = (
  | LegacyButtonProps
  | (TouchableOpacityProps & ContentStyle<Children>)
) & {
  maximumFontSizeMultiplier?: number
}

/**
 * The button that should be used for main CTAs and should have visual hierarchy
 * precedence over other ui elements.
 *
 * By default, the button uses a dark background with white text, though this can
 * be overriden by using the `style` prop. The button is also 48px tall, and
 * uses 16px horizontal paddings, to get a full screen button override `width` to
 * 100% in the `style` prop.
 */
export const PrimaryButton = <Children extends ReactNode>({
  style,
  contentStyle,
  disabled,
  ...props
}: ButtonProps<Children>) => (
  <BaseButton
    style={[
      styles.defaultPrimaryBackground,
      styles.container,
      style,
      { opacity: disabled ? 0.5 : 1 }
    ]}
    disabled={disabled}
    activeOpacity={0.8}
    contentStyle={[styles.primaryContent, contentStyle]}
    {...props}
  />
)

/**
 * An outlined button which should be used as a secondary element to other visual elements in the hierarchy.
 *
 * This can be used as a CTA, but not for actions we "for the profitable running of the business" would want
 * the user to tap such as leaving an event.
 *
 * The button is 48px tall, and uses 16px horizontal paddings, to get a full screen button override `width` to
 * 100% in the `style` prop.
 */
export const SecondaryOutlinedButton = <Children extends ReactNode>({
  style,
  disabled,
  ...props
}: ButtonProps<Children>) => (
  <BaseButton
    style={[
      styles.container,
      styles.outlinedButton,
      style,
      { opacity: disabled ? 0.4 : 1 }
    ]}
    disabled={disabled}
    activeOpacity={0.65}
    {...props}
  />
)

const BaseButton = <Children extends ReactNode>({
  style,
  maximumFontSizeMultiplier,
  ...props
}: ButtonProps<Children>) => (
  <TouchableOpacity
    {...props}
    style={[
      style,
      {
        height:
          48 * useFontScale({ maximumScaleFactor: maximumFontSizeMultiplier })
      }
    ]}
  >
    {"title" in props ? (
      <Headline
        maxFontSizeMultiplier={maximumFontSizeMultiplier}
        style={props.contentStyle}
      >
        {props.title}
      </Headline>
    ) : typeof props.children === "string" ||
      typeof props.children === "number" ? (
      <Headline
        maxFontSizeMultiplier={maximumFontSizeMultiplier}
        style={props.contentStyle}
      >
        {props.children}
      </Headline>
    ) : (
      <View style={props.contentStyle}>{props.children}</View>
    )}
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16
  },
  primaryContent: {
    color: "white"
  },
  defaultPrimaryBackground: {
    backgroundColor: AppStyles.darkColor
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: AppStyles.colorOpacity15
  }
})
