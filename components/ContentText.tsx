import React, { useMemo } from "react"
import { StyleSheet, TextProps } from "react-native"
import { openURL } from "expo-linking"
import { BodyText, Headline } from "./Text"
import { linkify } from "@lib/Linkify"
import { Match } from "linkify-it"

/**
 * Props for {@link ContextText}.
 */
export type ContentTextProps = {
  text: string
  onUserHandleTapped: (handle: string) => void

  /**
   * Defaults to expo's `openURL` function.
   */
  onURLTapped?: (url: string) => void
} & Omit<TextProps, "children">

/**
 * A text component which allows user handles and links to be interacted with.
 *
 * User handles are rendered in bold text, and urls supported by the app-wide linkify `@lib/Linkify`
 * config are underlined. Both kinds of interactive text blocks use the same color.
 */
export const ContentText = ({
  text,
  onUserHandleTapped: onHandleTapped,
  onURLTapped = openURL,
  ...props
}: ContentTextProps) => (
  <BodyText {...props} testID="regular-text">
    {useTextBlocks(text, onURLTapped, onHandleTapped)}
  </BodyText>
)

const useTextBlocks = (
  text: string,
  onURLTapped: (url: string) => void,
  onHandleTapped: (handle: string) => void
) => {
  return useMemo(
    () => renderLinkTextBlocks(text, onURLTapped, onHandleTapped),
    [text, onURLTapped, onHandleTapped]
  )
}

const renderLinkTextBlocks = (
  text: string,
  onURLTapped: (url: string) => void,
  onHandleTapped: (handle: string) => void
) => {
  const matches = linkify.match(text)
  if (!matches) return [text]
  return renderLinkifyMatches(text, matches, onURLTapped, onHandleTapped)
}

const renderLinkifyMatches = (
  text: string,
  matches: Match[],
  onURLTapped: (url: string) => void,
  onHandleTapped: (handle: string) => void
) => {
  const blocks = []
  let anchorIndex = 0
  for (const match of matches) {
    const isHandleMatch = match.schema === "@"
    blocks.push(text.substring(anchorIndex, match.index))

    if (isHandleMatch) {
      blocks.push(
        <Headline
          key={`handle-${match.index}`}
          style={styles.handle}
          onPress={() => onHandleTapped(match.text)}
        >
          {match.text}
        </Headline>
      )
    } else {
      blocks.push(
        <BodyText
          onPress={() => onURLTapped(match.url)}
          key={`url-${match.index}`}
          style={styles.link}
        >
          {match.text}
        </BodyText>
      )
    }
    anchorIndex = match.lastIndex
  }
  blocks.push(text.substring(anchorIndex))
  return blocks
}

const styles = StyleSheet.create({
  link: {
    color: "#4285F4",
    textDecorationLine: "underline"
  },
  handle: {
    color: "#4285F4"
  }
})
