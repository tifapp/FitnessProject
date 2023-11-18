import { Headline } from "@components/Text"
import React, { useState, useRef } from "react"
import {
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native"
import Animated, { FadeIn, Layout } from "react-native-reanimated"
import { ContentTextProps, ContentText } from "./ContentText"

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

const styles = StyleSheet.create({
  readMore: {
    marginTop: 8
  }
})
