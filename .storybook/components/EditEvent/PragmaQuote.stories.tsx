import React, { useState } from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  PragmaQuoteView,
  createEventQuote
} from "@edit-event-boundary/PragmaQuotes"
import { Provider, atom } from "jotai"

const EditEventPragmaQuotesMeta = {
  title: "Edit Event Pragma Quotes"
}

export default EditEventPragmaQuotesMeta

export const Basic = () => {
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
        <PragmaQuoteView quote={createEventQuote} animationInterval={5} />
      </View>
    </GestureHandlerRootView>
  )
}
