import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StoryMeta } from "storybook/HelperTypes";
import { TestStory } from "./TestStory";

export const TestStoryMeta: StoryMeta = {
  title: "TestStory",
};

export default TestStoryMeta;

export const Basic = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TestStory />
      </SafeAreaView>
    </GestureHandlerRootView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
});
