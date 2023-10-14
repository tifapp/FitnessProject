import { Caption, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { EventUserAttendeeStatus, isAttendingEvent } from "@lib/events"
import {
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

interface ChatSectionProps {
  color: string
  userAttendeeStatus: EventUserAttendeeStatus
}

const ChatSection = ({ color, userAttendeeStatus }: ChatSectionProps) => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <TouchableOpacity
      style={[styles.flexRow, styles.paddingIconSection]}
      onPress={() => {
        navigation.navigate("Chat Room")
      }}
    >
      <View style={[styles.iconStyling, { backgroundColor: color }]}>
        <Ionicon name="chatbox-ellipses" color={"white"} />
      </View>
      <View style={styles.spacing}>
        <Headline>Event Chat</Headline>
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
          style={{ alignSelf: "center" }}
          color={AppStyles.colorOpacity35}
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
