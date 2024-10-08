import { AppStyles } from "@lib/AppColorStyle"
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

const IOSDurationPickerView = ({
  initialDurationSeconds,
  onDurationChange,
  ...props
}: TimePickerProps) => (
  <DateTimePicker
    value={Date.fromSecondsSince1970(initialDurationSeconds)}
    accentColor={AppStyles.primaryColor}
    textColor={AppStyles.primaryColor}
    mode="countdown"
    display="spinner"
    onChange={useCallback(
      (_: any, selectedDate?: Date) => {
        if (selectedDate) {
          onDurationChange(selectedDate.ext.toSecondsSince1970())
        }
      },
      [onDurationChange]
    )}
    {...props}
  />
)

const NativeAndroidView: React.ComponentType<
  Omit<TimePickerProps, "onDurationChange"> & {
    onDurationChange: (event: { nativeEvent: { duration: number } }) => void
  }
> = requireNativeViewManager("TimePicker")

const AndroidDurationPickerView = ({
  style,
  onDurationChange,
  ...props
}: TimePickerProps) => (
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

export const DurationPickerView =
  Platform.OS === "android" ? AndroidDurationPickerView : IOSDurationPickerView
