import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const TestStory = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TestStory Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
