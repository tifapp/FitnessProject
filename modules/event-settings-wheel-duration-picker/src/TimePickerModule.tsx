import DateTimePicker from "@react-native-community/datetimepicker"
import { requireNativeViewManager } from "expo-modules-core"
import React, { useCallback } from "react"
import { Platform, StyleProp, ViewProps, ViewStyle } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"

export type TimePickerProps = {
  initialDurationSeconds: number
  onDurationChange: (durationSeconds: number) => void
  style?: StyleProp<ViewStyle>
} & ViewProps

const IOSTimePickerView = ({
  initialDurationSeconds,
  onDurationChange,
  ...props
}: TimePickerProps) => {
  return (
    <DateTimePicker
      value={Date.fromSeconds(initialDurationSeconds)}
      mode="countdown"
      display="spinner"
      onChange={useCallback(
        (_: any, selectedDate?: Date) => {
          if (selectedDate) {
            onDurationChange(
              selectedDate.ext.toSeconds()
            )
          }
        },
        [onDurationChange]
      )}
      {...props}
    />
  )
}

const NativeAndroidView: React.ComponentType<Omit<TimePickerProps, "onDurationChange"> & {
  onDurationChange: (event: { nativeEvent: { duration: number } }) => void
}> =
  requireNativeViewManager("TimePicker")

const AndroidTimePickerView = ({
  style,
  onDurationChange,
  ...props
}: TimePickerProps) => {
  return (
    <NativeViewGestureHandler disallowInterruption>
      <NativeAndroidView
        style={style}
        onDurationChange={useCallback(
          (event: { nativeEvent: { duration: number } }) => {
            onDurationChange(event.nativeEvent.duration)
          },
          [onDurationChange]
        )}
        {...props}
      />
    </NativeViewGestureHandler>
  )
}

export const TimePickerView =
  Platform.OS === "android" ? AndroidTimePickerView : IOSTimePickerView
