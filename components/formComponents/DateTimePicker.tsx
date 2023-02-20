import React from "react"
import { EmptyView } from "@components/common/EmptyView"
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle
} from "react-native"
import RNDateTimePicker from "@react-native-community/datetimepicker"

export type DateTimePickerProps = {
  label: string
  date: Date
  onDateChanged: (date: Date) => void
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const DateTimePicker = (props: DateTimePickerProps) => {
  return Platform.OS === "ios"
    ? (
    <_DateTimePickerIOS {...props} />
      )
    : (
    <EmptyView />
      )
}

const _DateTimePickerIOS = ({
  label,
  date,
  onDateChanged,
  style,
  textStyle
}: DateTimePickerProps) => (
  <View style={[styles.iOSContainer, style]}>
    <Text style={textStyle}>{label}</Text>
    <RNDateTimePicker
      mode="datetime"
      value={date}
      style={styles.iOSPickerStyle}
      onChange={(_, date) => {
        if (date) onDateChanged(date)
      }}
    />
  </View>
)

const styles = StyleSheet.create({
  iOSContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iOSPickerStyle: {
    width: 200
  }
})

export default DateTimePicker
