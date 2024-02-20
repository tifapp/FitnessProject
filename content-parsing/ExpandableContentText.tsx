import { Headline } from "@components/Text"
import React, { useEffect, useState } from "react"
import {
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native"
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated"
import { ContentTextProps, ContentText } from "./ContentText"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"

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
          layout={Layout.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.container}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            style={styles.readMore}
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
  container: {
    display: "flex",
    flexDirection: "row"
  },
  readMore: {
    marginTop: 8
  }
})
