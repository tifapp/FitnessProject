import { BodyText, Headline } from "@components/Text"
import React, { useEffect, useRef, useState } from "react"
import {
  Animated,
  StyleProp,
  TextProps,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"

export type ExpandableTextProps = {
  text: string
  linesToDisplay: number
} & TextProps

const TEXT_HEIGHT = 22

const ExpandableText = ({
  text,
  linesToDisplay,
  ...props
}: ExpandableTextProps) => {
  const [expander, setExpander] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [lineNumber, setLineNumber] = useState(linesToDisplay)
  const startingHeight = TEXT_HEIGHT * linesToDisplay
  const [fullHeight, setFullHeight] = useState(500)
  const [numLinesDetermined, setNumLinesDetermined] = useState(false)
  const animatedHeight = useRef(new Animated.Value(500)).current

  const toggleExpansion = () => {
    setExpanded(!expanded)
  }

  useEffect(() => {
    Animated.spring(animatedHeight, {
      friction: 100,
      toValue: expanded ? fullHeight : startingHeight,
      useNativeDriver: false
    }).start()
  }, [expanded])

  // Lower the height of the view if lines of text is less than the number to render
  useEffect(() => {
    if (lineNumber < linesToDisplay) {
      animatedHeight.setValue(TEXT_HEIGHT * lineNumber)
      setExpander(false)
    }
  }, [lineNumber])

  // Get number of lines text renders to and calculate full height
  const onTextLayout = (e: { nativeEvent: { lines: string | any[] } }) => {
    if (!numLinesDetermined) {
      const totalHeight = TEXT_HEIGHT * e.nativeEvent.lines.length
      setNumLinesDetermined(true)
      setLineNumber(e.nativeEvent.lines.length)

      if (totalHeight > startingHeight) {
        setFullHeight(totalHeight + 5)
        setExpander(true)
      }
    }
  }

  // Initially set numberOfLines to undefined since ios uses it as line.length otherwise
  return (
    <View>
      <Animated.View style={{ height: animatedHeight }}>
        <BodyText
          numberOfLines={
            !numLinesDetermined ? undefined : expanded ? 0 : linesToDisplay
          }
          ellipsizeMode="tail"
          onTextLayout={onTextLayout}
        >
          {text}
        </BodyText>
      </Animated.View>
      {expander && (
        <TouchableOpacity
          style={{ alignSelf: "flex-start" }}
          onPress={toggleExpansion}
        >
          <Headline {...props} style={[{ marginTop: 8 }, props.style]}>
            {expanded ? "Read Less" : "Read More"}
          </Headline>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default ExpandableText
