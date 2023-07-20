import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleSheet, Text, TextProps } from "react-native"

/**
 * A text component that represents the standard title of
 * some UI element.
 */
export const Title = (props: TextProps) => (
  <Text {...props} style={[props.style, styles.title]} />
)

/**
 * A text component for standard text that the user sees.
 */
export const BodyText = (props: TextProps) => (
  <Text {...props} style={[props.style, styles.body]} />
)

/**
 * A text component for smaller and more subtle details.
 */
export const Caption = (props: TextProps) => (
  <Text
    {...props}
    style={[styles.captionOpacity, props.style, styles.caption]}
  />
)

export const CaptionTitle = (props: TextProps) => (
  <Text {...props} style={[props.style, styles.captionTitle]} />
)

/**
 * A text component with the same font size as {@link BodyText}
 * that allows for more emphasis on a particular UI element
 * group.
 */
export const Headline = (props: TextProps) => (
  <Text {...props} style={[props.style, styles.headline]} />
)

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSansBold",
    fontSize: 24
  },
  body: {
    fontFamily: "OpenSans",
    fontSize: 16
  },
  caption: {
    fontFamily: "OpenSans",
    fontSize: 12
  },
  captionOpacity: {
    opacity: 0.5
  },
  captionTitle: {
    fontSize: 12,
    fontFamily: "OpenSansBold"
  },
  headline: {
    fontFamily: "OpenSansBold",
    fontSize: 16
  },
  color: {
    color: AppStyles.darkColor
  }
})
