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
export const Subtitle = (props: TextProps) => (
  <Text {...props} style={[props.style, styles.subtitle]} />
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
  subtitle: {
    fontFamily: "OpenSans",
    fontSize: 12,
    opacity: 0.35
  },
  headline: {
    fontFamily: "OpenSansBold",
    fontSize: 16
  }
})
