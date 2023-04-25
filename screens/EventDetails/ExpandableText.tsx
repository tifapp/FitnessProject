import { BodyText, Headline } from "@components/Text"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Animated, Easing, TextProps, View } from "react-native"

export type ExpandableTextProps = {
  props: TextProps
  text: string
  linesToDisplay: number
}

const ExpandableText = ({
  props,
  text,
  linesToDisplay
}: ExpandableTextProps) => {
  const [expander, setExpander] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [lineNumber, setLineNumber] = useState(linesToDisplay)
  const [lineHeight, setLineHeight] = useState(22)
  const startingHeight = lineHeight * linesToDisplay
  const [fullHeight, setFullHeight] = useState(startingHeight)
  const animatedHeight = useRef(new Animated.Value(startingHeight)).current

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

  useEffect(() => {
    if (lineNumber < linesToDisplay) {
      animatedHeight.setValue(lineHeight * lineNumber)
      setExpander(false)
    }
  }, [animatedHeight, text, lineNumber])

  const onLayout = (e: { nativeEvent: { layout: { height: any } } }) => {
    let { height } = e.nativeEvent.layout
    height = Math.floor(height) + lineHeight * (lineNumber - linesToDisplay)

    if (height > startingHeight) {
      setFullHeight(height)
      setExpander(true)
    }
  }

  const onTextLayout = (e: { nativeEvent: { lines: string | any[] } }) => {
    setLineNumber(e.nativeEvent.lines.length)
    setLineHeight(e.nativeEvent.lines[0].height)
  }

  return (
    <View>
      <Animated.View style={{ height: animatedHeight }}>
        <View onLayout={onLayout}>
          <BodyText
            numberOfLines={expanded ? 0 : linesToDisplay}
            ellipsizeMode="tail"
            onTextLayout={onTextLayout}
          >
            {text}
          </BodyText>
        </View>
      </Animated.View>
      {expander && (
        <Headline {...props} style={props?.style} onPress={toggleExpansion}>
          {expanded ? "Read Less" : "Read More"}
        </Headline>
      )}
    </View>
  )
}

export default ExpandableText
