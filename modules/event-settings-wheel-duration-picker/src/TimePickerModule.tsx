import { requireNativeViewManager } from "expo-modules-core"
import React from "react"
import { StyleProp, ViewProps, ViewStyle } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"

type OnDurationChangeEvent = {
  duration: number
}

export type TimePickerProps = {
  initialDuration: number
  onDurationChange: (event: { nativeEvent: OnDurationChangeEvent }) => void
  style?: StyleProp<ViewStyle>
} & ViewProps

const NativeView: React.ComponentType<TimePickerProps> =
  requireNativeViewManager("TimePicker")

export const TimePickerView = ({
  style,
  onDurationChange,
  ...props
}: TimePickerProps) => {
  return (
    <NativeViewGestureHandler disallowInterruption>
      <NativeView
        style={style}
        onDurationChange={onDurationChange}
        {...props}
      />
    </NativeViewGestureHandler>
  )
}
