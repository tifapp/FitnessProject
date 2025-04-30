import React from "react"
import { StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { StoryMeta } from "storybook/HelperTypes"
import { PragmaDesign } from "./PragmaDesign"

export const PragmaDesignMeta: StoryMeta = {
  title: "PragmaDesign"
}

export default PragmaDesignMeta

export const Basic = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <PragmaDesign />
      </SafeAreaView>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    padding: 16
  }
})
