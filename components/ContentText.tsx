import React, { useMemo, useRef, useState } from "react"
import {
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import { openURL } from "expo-linking"
import { BodyText, Headline } from "./Text"
import { linkify } from "@lib/Linkify"
import { Match } from "linkify-it"
import { UserHandle, UserHandleLinkifyMatch } from "@lib/users"
import { EventHandle, EventHandleLinkifyMatch } from "@event-details"
import Animated, { FadeIn, Layout } from "react-native-reanimated"

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

export type ExpandableContentTextProps = {
  collapsedLineLimit: number
  initialText: string
  contentTextStyle?: StyleProp<TextStyle>
  expandButtonTextStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
} & Omit<ContentTextProps, "numberOfLines" | "text" | "style">

/**
 * Content text that expands when the user presses a "Read More" button.
 *
 * At the moment, this only renders the initial text given to it correctly, it does not
 * render any changes to the input text.
 */
export const ExpandableContentText = ({
  collapsedLineLimit,
  onTextLayout,
  initialText,
  contentTextStyle,
  expandButtonTextStyle,
  style,
  ...props
}: ExpandableContentTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expansionStatus, setExpansionStatus] = useState<
    "expandable" | "unexpandable" | undefined
  >()
  const textSplitsRef = useRef({ collapsedText: "", expandedText: "" })
  const numberOfLines = expansionStatus
    ? collapsedLineLimit
    : collapsedLineLimit + 1
  return (
    <View style={style}>
      <ContentText
        {...props}
        text={isExpanded ? textSplitsRef.current.collapsedText : initialText}
        numberOfLines={isExpanded ? undefined : numberOfLines}
        onTextLayout={(e) => {
          if (expansionStatus) {
            onTextLayout?.(e)
            return
          }
          const textBlocks = e.nativeEvent.lines.map((line) => line.text)
          const visibleText = textBlocks
            .slice(0, textBlocks.length - 1)
            .join("")
          textSplitsRef.current.collapsedText = visibleText.endsWith("\n")
            ? visibleText.slice(0, visibleText.length - 1)
            : visibleText
          textSplitsRef.current.expandedText = initialText.slice(
            visibleText.length
          )
          setExpansionStatus(
            textBlocks.length !== collapsedLineLimit + 1
              ? "unexpandable"
              : "expandable"
          )
          onTextLayout?.(e)
        }}
        style={[contentTextStyle, { opacity: expansionStatus ? 1 : 0 }]}
      />
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(300)}>
          <ContentText {...props} text={textSplitsRef.current.expandedText} />
        </Animated.View>
      )}
      {expansionStatus === "expandable" && (
        <Animated.View layout={Layout.duration(300)}>
          <TouchableOpacity
            onPress={() => setIsExpanded((expanded) => !expanded)}
            style={styles.readMore}
            hitSlop={44}
          >
            <Headline style={expandButtonTextStyle}>
              {isExpanded ? "Read Less" : "Read More"}
            </Headline>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

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
      const userHandleMatch = match as UserHandleLinkifyMatch
      blocks.push(
        <Headline
          key={`user-handle-${match.index}`}
          style={styles.handle}
          onPress={() => onUserHandleTapped(userHandleMatch.userHandle)}
        >
          {userHandleMatch.text}
        </Headline>
      )
    } else if (match.schema === "!") {
      const eventHandleMatch = match as EventHandleLinkifyMatch
      blocks.push(
        <Headline
          key={`event-handle-${match.index}`}
          style={styles.handle}
          onPress={() => onEventHandleTapped(eventHandleMatch.eventHandle)}
        >
          {eventHandleMatch.eventHandle.eventName}
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
  },
  readMore: {
    marginTop: 8
  }
})
