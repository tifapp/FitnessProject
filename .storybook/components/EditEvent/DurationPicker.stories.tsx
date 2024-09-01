import React, { useState } from "react"
import { Button, View } from "react-native"
import { EditEventDurationPickerView } from "@edit-event/DurationPicker"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Provider, atom } from "jotai"

const EditEventDurationsMeta = {
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

const presetsAtom = atom(1100)
export const Basic = () => {
  const [presets, setPresets] = useState(PRESETS)
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
        <Provider>
          <EditEventDurationPickerView
            durationAtom={presetsAtom}
            presetOptions={presets}
          />
        </Provider>
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
