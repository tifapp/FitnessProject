import React from "react";
import { View, Text } from "react-native";
import { StoryMeta } from "storybook/HelperTypes";

export const SunJournalBackgroundMeta: StoryMeta = {
  title: "SunJournalBackground",
};

export default SunJournalBackgroundMeta;

export const Basic = () => (
  <View>
    <Text>SunJournalBackground</Text>
  </View>
);
