import { StoryMeta } from "../HelperTypes"
import React, { useEffect, useState } from "react"
import { Button, View } from "react-native"
import { EditEventDurationPickerView } from "@edit-event/DurationPicker"

const EditEventDurationsMeta: StoryMeta = {
  title: "Edit Event Durations"
}

export default EditEventDurationsMeta

const PRESETS = [300, 600, 900, 1200, 3600, 5400].sort((a, b) => a - b)

export const Basic = () => {
  const [presets, setPresets] = useState(PRESETS)
  const [value, setValue] = useState(PRESETS[3])
  console.log(presets)
  return (
    <View style={{ marginTop: 256, paddingHorizontal: 24 }}>
      <EditEventDurationPickerView
        value={value}
        onSelected={setValue}
        presetOptions={presets}
      />
      <Button
        title="Filter"
        onPress={() => {
          if (presets !== PRESETS) {
            setPresets(PRESETS)
          } else {
            setPresets((p) => p.filter((i) => i % 5 != 0))
          }
        }}
      />
    </View>
  )
}
