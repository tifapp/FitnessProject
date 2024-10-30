import React from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Headline } from "@components/Text"
import "./Register"
import { RudeusRegisterView, useRudeusRegister } from "./Register"
import { MOCK_USER } from "./Models"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { RudeusPatternsView } from "./Patterns"
import { neverPromise } from "@test-helpers/Promise"
import { uuidString } from "@lib/utils/UUID"
import {
  hapticPattern,
  events,
  continuousEvent,
  parameters,
  parameterCurve,
  keyFrame
} from "@modules/tif-haptics"

const RudeusEditorMeta = {
  title: "Rudeus Editor"
}

export default RudeusEditorMeta

export const Basic = () => {
  return (
    <TestQueryClientProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <Root />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </TestQueryClientProvider>
  )
}

const patterns = [
  {
    id: uuidString(),
    name: "Test",
    ahapPattern: hapticPattern(
      events(
        continuousEvent(0.0, 1.7, {
          HapticIntensity: 1.0,
          HapticSharpness: 0.5
        })
      ),
      parameters(
        parameterCurve("HapticIntensityControl", 0.0, [
          keyFrame(0.0, 0.0),
          keyFrame(0.5, 1.1),
          keyFrame(0.0, 1.7)
        ]),
        parameterCurve("HapticSharpnessControl", 0.0, [
          keyFrame(-0.8, 0.0),
          keyFrame(0.8, 1.7)
        ])
      )
    ),
    platform: "ios",
    user: MOCK_USER
  },
  {
    id: uuidString(),
    name: "Test 2",
    ahapPattern: hapticPattern(
      events(
        continuousEvent(0.0, 1.7, {
          HapticIntensity: 1.0,
          HapticSharpness: 0.5
        })
      ),
      parameters(
        parameterCurve("HapticIntensityControl", 0.0, [
          keyFrame(0.0, 0.0),
          keyFrame(0.5, 1.1),
          keyFrame(0.0, 1.7)
        ]),
        parameterCurve("HapticSharpnessControl", 0.0, [
          keyFrame(-0.8, 0.0),
          keyFrame(0.8, 1.7)
        ])
      )
    ),
    platform: "android",
    user: MOCK_USER
  }
]

const Root = () => {
  return (
    <RudeusPatternsView
      onCreatePatternTapped={() => console.log("Create")}
      onPatternTapped={(p) => console.log(p)}
      patterns={async () => patterns}
      style={{ height: "100%" }}
    />
  )
}
