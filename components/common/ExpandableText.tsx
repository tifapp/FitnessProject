import { BodyText, Headline } from "@components/Text";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  TextProps,
  View,
} from "react-native";

export type ExpandableTextProps = {
  props: TextProps
  text: string
  linesToDisplay: number
}

const ExpandableText = ({props, text, linesToDisplay}: ExpandableTextProps) => {
  const [lineHeight] = useState(new Animated.Value(linesToDisplay));
  const [readMore, setReadMore] = useState(false)
  const [expanded, setExpanded] = useState(false)
/*
  useEffect(() => {
    Animated.timing(height, {
      toValue: !expanded ? 200 : 0,
      duration: 150,
      useNativeDriver: false
    }).start();
  }, [expanded, height]);*/

  const expandText = () => {
    Animated.timing(lineHeight, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start
  }

  const reduceText = () => {
    Animated.timing(lineHeight, {
      toValue: linesToDisplay,
      duration: 3000,
      useNativeDriver: true,
    }).start
  }

  const onTextLayout = useCallback((e: { nativeEvent: { lines: string | any[]; }; }) =>{
    setReadMore(e.nativeEvent.lines.length > linesToDisplay); //to check the text is more than 4 lines or not
    // console.log(e.nativeEvent);
},[]);

  const toggleNumberOfLines = () => { //To toggle the show text or hide it
    if (expanded) {
      reduceText()
    } else {
      expandText()
    }
    setExpanded(!expanded);
  }

  

  // console.log('rerendered');

  return (
    <Animated.View
      //style={{ height, backgroundColor: "orange" }}
    >
      <BodyText 
        numberOfLines={expanded ? 0 : linesToDisplay}
        onTextLayout={onTextLayout}>
          {text}
      </BodyText>
      {
        readMore ? <Headline
            {...props}
            style={props?.style}
            onPress={toggleNumberOfLines}>
            {expanded ? 'Read Less' : 'Read More'}
          </Headline> : null
      }
    </Animated.View>
  )
}

export default ExpandableText