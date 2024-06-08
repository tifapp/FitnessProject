import React, { useEffect, useMemo, useState } from "react"
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
import { BodyText, Headline } from "../components/Text"
import { Match } from "linkify-it"
import {
  UserHandle,
  UserHandleLinkifyMatch
} from "TiFShared/domain-models/User"
import {
  EventHandle,
  EventHandleLinkifyMatch
} from "TiFShared/domain-models/Event"
import { linkify } from "TiFShared/lib/LinkifyIt"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import Animated, {
  FadeOut,
  FadeIn,
  LinearTransition
} from "react-native-reanimated"
import { useOpenWeblink } from "@modules/tif-weblinks"

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
  ...props
}: ContentTextProps) => {
  const onURLTapped = useOpenWeblink()
  return (
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
          style={{ color: eventHandleMatch.eventHandle.color.toString() }}
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

export type ExpandableContentTextProps = {
  collapsedLineLimit: number
  text: string
  expandButtonText?: string
  contentTextStyle?: StyleProp<TextStyle>
  expandButtonTextStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
} & Omit<ContentTextProps, "numberOfLines" | "text" | "style">

/**
 * Content text that expands when the user presses a "Read More" button.
 */
export const ExpandableContentText = ({
  collapsedLineLimit,
  onTextLayout,
  text,
  contentTextStyle,
  expandButtonTextStyle,
  expandButtonText = "Read More",
  style,
  ...props
}: ExpandableContentTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [textState, setTextState] = useState({
    text,
    lineLimit: collapsedLineLimit,
    expansionStatus: undefined as "expandable" | "unexpandable" | undefined
  })
  const resetTextStateIfNeeded = useEffectEvent(
    (text: string, lineLimit: number) => {
      if (text !== textState.text || lineLimit !== textState.lineLimit) {
        setTextState({ text, lineLimit, expansionStatus: undefined })
      }
    }
  )
  useEffect(() => {
    resetTextStateIfNeeded(text, collapsedLineLimit)
  }, [text, collapsedLineLimit, resetTextStateIfNeeded])
  const numberOfLines = textState.expansionStatus
    ? collapsedLineLimit
    : collapsedLineLimit + 1
  return (
    <View style={style}>
      {!isExpanded && (
        // NB: By having a long fade out on this text, it creates a cross-fade
        // effect involving the uncollapsed text such that the user can't tell
        // that the uncollapsed text is fading out thus preventing a flicker in
        // the ui.
        <Animated.View exiting={FadeOut.duration(1000)}>
          <ContentText
            {...props}
            text={textState.text}
            numberOfLines={isExpanded ? undefined : numberOfLines}
            onTextLayout={(e) => {
              if (textState.expansionStatus) {
                onTextLayout?.(e)
                return
              }
              const textBlocks = e.nativeEvent.lines.map((line) => line.text)
              setTextState((state) => ({
                ...state,
                expansionStatus:
                  textBlocks.length <= collapsedLineLimit
                    ? "unexpandable"
                    : "expandable"
              }))
              onTextLayout?.(e)
            }}
            style={[contentTextStyle]}
          />
        </Animated.View>
      )}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(500)}>
          <ContentText {...props} text={textState.text} />
        </Animated.View>
      )}
      {textState.expansionStatus === "expandable" && !isExpanded && (
        <Animated.View
          layout={LinearTransition.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.expandableContainer}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            style={styles.expandableReadMore}
            hitSlop={44}
          >
            <Headline style={expandButtonTextStyle}>
              {expandButtonText}
            </Headline>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  link: {
    color: "#4285F4",
    textDecorationLine: "underline"
  },
  handle: {
    color: "#4285F4"
  },
  expandableContainer: {
    display: "flex",
    flexDirection: "row"
  },
  expandableReadMore: {
    marginTop: 8
  }
})
