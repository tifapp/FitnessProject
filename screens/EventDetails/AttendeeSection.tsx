import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Headline, Caption } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { Ionicon } from "@components/common/Icons"
import { Divider } from "react-native-elements"

interface AttendeeSectionProps {
  color: string
  attendeeCount: number
}

const AttendeeSection = ({ color, attendeeCount }: AttendeeSectionProps) => {
  const [textWidth, setTextWidth] = useState(0)
  const [chevronWidth, setChevronWidth] = useState(0)

  const onLayoutView = (e: { nativeEvent: { layout: { width: any } } }) => {
    setTextWidth(e.nativeEvent.layout.width)
  }

  const onLayoutChevron = (e: { nativeEvent: { layout: { width: any } } }) => {
    setChevronWidth(e.nativeEvent.layout.width)
  }

  return (
    <View>
      <TouchableOpacity style={[styles.flexRow, styles.paddingIconSection]}>
        <View style={[styles.iconStyling, { backgroundColor: color }]}>
          <Ionicon name="people" color={"white"} />
        </View>
        <View style={styles.spacing} onLayout={onLayoutView}>
          <Headline>{`${attendeeCount} Attending`}</Headline>
          <Caption>View all attendees</Caption>
        </View>
        <View
          style={[styles.flexRow, { flex: 1, justifyContent: "flex-end" }]}
          onLayout={onLayoutChevron}
        >
          <Ionicon
            name="chevron-forward"
            style={{ alignSelf: "center" }}
            color={AppStyles.colorOpacity35}
          />
        </View>
      </TouchableOpacity>
      <Divider
        style={[styles.divider, { width: textWidth + chevronWidth + 16 }]}
      />
    </View>
  )
}

export default AttendeeSection

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  paddingIconSection: {
    paddingHorizontal: 16,
    alignItems: "center"
  },
  iconStyling: {
    padding: 6,
    marginRight: 16,
    borderRadius: 12,
    justifyContent: "center"
  },
  spacing: {
    flex: 1
  },
  divider: {
    marginVertical: 16,
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  }
})
