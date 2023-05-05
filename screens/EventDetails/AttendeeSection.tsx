import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Headline, Caption } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { Ionicon } from "@components/common/Icons"

interface AttendeeSectionProps {
  color: string
  attendeeCount: number
}

const AttendeeSection = ({ color, attendeeCount }: AttendeeSectionProps) => {
  return (
    <TouchableOpacity style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={[styles.iconStyling, { backgroundColor: color }]}>
        <Ionicon name="people" color={"white"} />
      </View>
      <View style={styles.spacing}>
        <Headline>{`${attendeeCount} Attending`}</Headline>
        <Caption>View all attendees</Caption>
      </View>
      <View style={[styles.flexRow, { flex: 1, justifyContent: "flex-end" }]}>
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
        />
      </View>
    </TouchableOpacity>
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
    borderRadius: 12,
    justifyContent: "center"
  },
  spacing: {
    paddingHorizontal: 16
  }
})
