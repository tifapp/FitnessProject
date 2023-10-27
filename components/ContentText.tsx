import React, { useMemo } from "react"
import { StyleSheet, TextProps } from "react-native"
import { openURL } from "expo-linking"
import { BodyText, Headline } from "./Text"
import { linkify } from "@lib/Linkify"
import { Match } from "linkify-it"
import { UserHandle } from "@lib/users"
import { EventHandle } from "@event-details"

export type ContentTextCallbacks = {
  onUserHandleTapped: (handle: UserHandle) => void
  onEventHandleTapped: (handle: EventHandle) => void
  onURLTapped: (url: string) => void
}

/**
 * Props for {@link ContextText}.
 */
export type ContentTextProps = {
  text: string

  /**
   * Defaults to expo's `openURL` function.
   */
  onURLTapped?: (url: string) => void
} & Omit<TextProps, "children"> &
  Omit<ContentTextCallbacks, "onURLTapped">

/**
 * A text component which allows user handles and links to be interacted with.
 *
 * User handles are rendered in bold text, and urls supported by the app-wide linkify `@lib/Linkify`
 * config are underlined. Both kinds of interactive text blocks use the same color.
 */
export const ContentText = ({
  text,
  onUserHandleTapped,
  onEventHandleTapped,
  onURLTapped = openURL,
  ...props
}: ContentTextProps) => (
  <BodyText {...props} testID="regular-text">
    {useTextBlocks(
      text,
      useMemo(
        () => ({ onURLTapped, onEventHandleTapped, onUserHandleTapped }),
        [onUserHandleTapped, onEventHandleTapped, onURLTapped]
      )
    )}
  </BodyText>
)

const useTextBlocks = (text: string, callbacks: ContentTextCallbacks) => {
  return useMemo(() => renderLinkTextBlocks(text, callbacks), [text, callbacks])
}

const renderLinkTextBlocks = (
  text: string,
  callbacks: ContentTextCallbacks
) => {
  const matches = linkify.match(text)
  if (!matches) return [text]
  return renderLinkifyMatches(text, matches, callbacks)
}

const renderLinkifyMatches = (
  text: string,
  matches: Match[],
  { onURLTapped, onEventHandleTapped, onUserHandleTapped }: ContentTextCallbacks
) => {
  const blocks = []
  let anchorIndex = 0
  for (const match of matches) {
    blocks.push(text.substring(anchorIndex, match.index))

    if (match.schema === "@") {
      blocks.push(
        <Headline
          key={`user-handle-${match.index}`}
          style={styles.handle}
          onPress={() => {
            const handle = UserHandle.parse(match.text.slice(1)).handle
            if (handle) onUserHandleTapped(handle)
          }}
        >
          {match.text}
        </Headline>
      )
    } else if (match.schema === "!") {
      blocks.push(
        <Headline
          key={`event-handle-${match.index}`}
          style={styles.handle}
          onPress={() => {
            const handle = EventHandle.parse(match.text.slice(1))
            if (handle) onEventHandleTapped(handle)
          }}
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
