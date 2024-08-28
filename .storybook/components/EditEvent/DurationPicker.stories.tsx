import { StoryMeta } from "../HelperTypes"
import React, { useEffect, useState } from "react"
import { Button, View } from "react-native"
import { EditEventDurationPickerView } from "@edit-event/DurationPicker"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const EditEventDurationsMeta: StoryMeta = {
  title: "Edit Event Durations"
}

export default EditEventDurationsMeta

const PRESETS = [300, 601, 900, 1201, 3601, 5400].sort((a, b) => a - b)

export const Basic = () => {
  const [presets, setPresets] = useState(PRESETS)
  const [value, setValue] = useState(1100)
  console.log(presets)
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
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
