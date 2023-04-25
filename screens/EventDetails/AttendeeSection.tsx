import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Headline, Caption } from "@components/Text"

interface AttendeeSectionProps {
  color: string
  attendeeCount: number
}

const AttendeeSection = ({ color, attendeeCount }: AttendeeSectionProps) => {
  return (
    <TouchableOpacity style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicons
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="people"
          color={"white"}
          size={24}
        />
      </View>
      <View style={styles.spacing}>
        <Headline>{`${attendeeCount} Attending`}</Headline>
        <Caption>View all attendees</Caption>
      </View>
      <View style={[styles.flexRow, { flex: 1, justifyContent: "flex-end" }]}>
        <Ionicons
          name="chevron-forward"
          size={20}
          style={{ alignSelf: "center", opacity: 0.3 }}
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
    paddingHorizontal: 16
  },
  iconStyling: {
    padding: 6,
    borderRadius: 12
  },
  spacing: {
    paddingHorizontal: 16
  }
})
