import { AppStyles } from "@lib/AppColorStyle"
import { useConst } from "@lib/utils/UseConst"
import DateTimePicker from "@react-native-community/datetimepicker"
import { requireNativeViewManager } from "expo-modules-core"
import React, { useCallback } from "react"
import { Platform, StyleProp, ViewProps, ViewStyle } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import { now } from "TiFShared/lib/Dayjs"

export type TimePickerProps = {
  initialDurationSeconds: number
  onDurationChange: (durationSeconds: number) => void
  style?: StyleProp<ViewStyle>
} & ViewProps

const IOSDurationPickerView = ({
  initialDurationSeconds,
  onDurationChange,
  ...props
}: TimePickerProps) => {
  const startOfDay = useConst(now().startOf("day"))
  return (
    <DateTimePicker
      value={startOfDay.set("seconds", initialDurationSeconds).toDate()}
      accentColor={AppStyles.primaryColor}
      textColor={AppStyles.primaryColor}
      mode="countdown"
      display="spinner"
      onChange={useCallback(
        (_: any, selectedDate?: Date) => {
          if (selectedDate) {
            onDurationChange(selectedDate.ext.diff(startOfDay.toDate()).seconds)
          }
        },
        [onDurationChange, startOfDay]
      )}
      {...props}
    />
  )
}

const NativeAndroidView =
  Platform.OS === "android" ? requireNativeViewManager("TimePicker") : undefined

export const DurationPickerView = NativeAndroidView
  ? ({ style, onDurationChange, ...props }: TimePickerProps) => (
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
  : IOSDurationPickerView
