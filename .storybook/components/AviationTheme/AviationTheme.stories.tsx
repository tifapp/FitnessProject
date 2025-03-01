import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StoryMeta } from "storybook/HelperTypes";
import ConfigurableOrbitalComponent from "./AviationTheme";

export const AviationThemeMeta: StoryMeta = {
  title: "AviationTheme",
};

export default AviationThemeMeta;

export const Basic = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ConfigurableOrbitalComponent />
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
