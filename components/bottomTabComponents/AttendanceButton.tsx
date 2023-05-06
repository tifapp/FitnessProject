import { OutlinedButton, PrimaryButton } from "@components/common/Buttons"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { EventUserAttendeeStatus, isAttendingEvent } from "@lib/events"

const BOTTOM_TAB_HEIGHT = 80

interface LeaveJoinButtonProps {
  attendeeStatus: EventUserAttendeeStatus
  style?: StyleProp<ViewStyle>
}

const AttendanceButton = ({ attendeeStatus, style }: LeaveJoinButtonProps) => {
  return (
    <View style={[style, styles.bottomTab]}>
      {isAttendingEvent(attendeeStatus)
        ? (
          <OutlinedButton
            title={attendeeStatus == "hosting" ? "Delete Event" : "Leave Event"}
            style={styles.buttonStyle}
          />
        )
        : (
          <PrimaryButton title={"Join Now"} style={styles.buttonStyle} />
        )}
    </View>
  )
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_TAB_HEIGHT,
    backgroundColor: "white"
  },
  buttonStyle: {
    flex: 1
  }
})

export default AttendanceButton
