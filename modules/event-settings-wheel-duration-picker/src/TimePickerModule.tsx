import { requireNativeViewManager } from "expo-modules-core"
import React, { useState } from "react"
import {
  LayoutRectangle,
  StyleProp,
  View,
  ViewProps,
  ViewStyle
} from "react-native"
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
  const [layout, setLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  console.log(layout)
  return (
    <View style={style} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
      <NativeViewGestureHandler disallowInterruption>
        <NativeView
          style={style}
          size={layout}
          onDurationChange={onDurationChange}
          {...props}
        />
      </NativeViewGestureHandler>
    </View>
  )
}
