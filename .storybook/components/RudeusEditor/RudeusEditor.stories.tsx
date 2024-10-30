import React from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Headline } from "@components/Text"
import "./Register"
import { RudeusRegisterView, useRudeusRegister } from "./Register"
import { MOCK_USER } from "./Models"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

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

const Root = () => {
  const state = useRudeusRegister({
    register: async () => {
      throw new Error("Fuck")
    },
    onSuccess: console.log
  })
  return (
    <SafeAreaView>
      <RudeusRegisterView state={state} style={{ height: "100%" }} />
    </SafeAreaView>
  )
}
