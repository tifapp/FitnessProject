import React, { useMemo } from "react"
import { StyleSheet, TextProps } from "react-native"
import { openURL } from "expo-linking"
import { BodyText } from "./Text"
import linkifyIt, { Match } from "linkify-it"

const linkify = linkifyIt()

export type ContentTextProps = {
  text: string
  onURLTapped?: (url: string) => void
} & TextProps

export const ContentText = ({
  text,
  onURLTapped = openURL,
  ...props
}: ContentTextProps) => {
  const textBlocks = useMemo(
    () => renderLinkTextBlocks(text, onURLTapped),
    [text, onURLTapped]
  )
  return (
    <BodyText {...props} testID="regular-text">
      {textBlocks}
    </BodyText>
  )
}

const renderLinkTextBlocks = (
  text: string,
  onURLTapped: (url: string) => void
) => {
  const matches = linkify.match(text)
  if (!matches) return [text]
  return renderLinkifyMatches(text, matches, onURLTapped)
}

const renderLinkifyMatches = (
  text: string,
  matches: Match[],
  onURLTapped: (url: string) => void
) => {
  const blocks = []
  let anchor = 0
  for (const match of matches) {
    blocks.push(text.substring(anchor, match.index))
    blocks.push(
      <BodyText
        onPress={() => onURLTapped(match.url)}
        key={`url-${match.index}`}
        style={styles.link}
      >
        {match.text}
      </BodyText>
    )
    anchor = match.lastIndex
  }
  blocks.push(text.substring(anchor))
  return blocks
}

const styles = StyleSheet.create({
  link: {
    color: "#4285F4",
    textDecorationLine: "underline"
  }
})
