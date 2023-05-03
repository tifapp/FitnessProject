import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Headline, Caption } from "@components/Text"
import { EventUserAttendeeStatus, isAttendingEvent } from "@lib/events"
import { ButtonStyles } from "@lib/AppColorStyle"
import { Ionicon } from "@components/common/Icons"

interface ChatSectionProps {
  color: string
  userAttendeeStatus: EventUserAttendeeStatus
}

const ChatSection = ({ color, userAttendeeStatus }: ChatSectionProps) => {
  return (
    <TouchableOpacity style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicon
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="chatbox-ellipses"
          color={"white"}
        />
      </View>
      <View style={styles.spacing}>
        <Headline style={styles.textColor}>Event Chat</Headline>
        {isAttendingEvent(userAttendeeStatus)
          ? (
            <Caption>View the chat</Caption>
          )
          : (
            <Caption>Join this event to access the chat</Caption>
          )}
      </View>
      <View style={[styles.flexRow, { flex: 1, justifyContent: "flex-end" }]}>
        <Ionicon
          name="chevron-forward"
          style={{ alignSelf: "center"}}
          color={ButtonStyles.colorOpacity35}
        />
      </View>
    </TouchableOpacity>
  )
}

export default ChatSection

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
  },
  textColor: {
    color: ButtonStyles.darkColor
  }
})
