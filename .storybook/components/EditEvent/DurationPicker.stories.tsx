import { StoryMeta } from "../HelperTypes"
import React, { useEffect, useState } from "react"
import { Button, View } from "react-native"
import { EditEventDurationPickerView } from "@edit-event/DurationPicker"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const EditEventDurationsMeta: StoryMeta = {
  title: "Edit Event Durations"
}

export default EditEventDurationsMeta

const PRESETS = [
  300 * 15,
  601 * 15,
  900 * 15,
  1201 * 15,
  3601 * 15,
  5400 * 15
].sort((a, b) => a - b)

export const Basic = () => {
  const [presets, setPresets] = useState(PRESETS)
  const [value, setValue] = useState(1100)
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 40, rowGap: 24 }}>
        <EditEventDurationPickerView
          value={value}
          onValueChange={setValue}
          presetOptions={presets}
        />
        <Button
          title="Filter"
          onPress={() => {
            if (presets !== PRESETS) {
              setPresets(PRESETS)
            } else {
              setPresets((p) => p.filter((i) => i % 2 !== 0))
            }
          }}
        />
      </View>
    </GestureHandlerRootView>
  )
}
