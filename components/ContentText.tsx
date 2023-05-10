import React, { useMemo } from "react"
import { StyleSheet, TextProps } from "react-native"
import { openURL } from "expo-linking"
import { BodyText, Headline } from "./Text"
import linkifyIt, { Match } from "linkify-it"

const linkify = linkifyIt()

linkify.add("@", {
  validate: function (text, pos, self) {
    const tail = text.slice(pos)

    if (!self.re.twitter) {
      self.re.twitter = new RegExp(
        "^([a-zA-Z0-9_]){1,15}(?!_)(?=$|" + self.re.src_ZPCc + ")"
      )
    }
    if (self.re.twitter.test(tail)) {
      // Linkifier allows punctuation chars before prefix,
      // but we additionally disable `@` ("@@mention" is invalid)
      if (pos >= 2 && tail[pos - 2] === "@") {
        return false
      }
      return tail.match(self.re.twitter)[0].length
    }
    return 0
  },
  normalize: function (match) {
    match.url = "tifapp://user/" + match.url.replace(/^@/, "")
  }
})

export type ContentTextProps = {
  text: string
  onHandleTapped: (handle: string) => void
  onURLTapped?: (url: string) => void
} & TextProps

export const ContentText = ({
  text,
  onHandleTapped,
  onURLTapped = openURL,
  ...props
}: ContentTextProps) => {
  const textBlocks = useMemo(
    () => renderLinkTextBlocks(text, onURLTapped, onHandleTapped),
    [text, onURLTapped, onHandleTapped]
  )
  return (
    <BodyText {...props} testID="regular-text">
      {textBlocks}
    </BodyText>
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
  let anchor = 0
  for (const match of matches) {
    console.log(match)
    const isHandleMatch = match.schema === "@"
    blocks.push(text.substring(anchor, match.index))

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
          onPress={() => {
            if (isHandleMatch) {
              onHandleTapped(match.text)
            } else {
              onURLTapped(match.url)
            }
          }}
          key={`url-${match.index}`}
          style={styles.link}
        >
          {match.text}
        </BodyText>
      )
    }
    anchor = match.lastIndex
  }
  blocks.push(text.substring(anchor))
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
