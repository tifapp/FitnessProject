import { AlphaRegisterView, useAlphaRegister } from "@core-root/AlphaRegister"
import { uuidString } from "TiFShared/lib/UUID"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { UserHandle } from "TiFShared/domain-models/User"

export const NameEntryMeta = {
  title: "NameEntry"
}

export default NameEntryMeta

const TestAlphaRegisterView = () => {
  return (
    <SafeAreaView>
      <AlphaRegisterView
        style={{
          height: "100%"
        }}
        state={useAlphaRegister()}
      />
    </SafeAreaView>
  )
}

export const Basic = () => {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <TestQueryClientProvider>
          <TestAlphaRegisterView />
        </TestQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
