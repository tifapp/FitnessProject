import React from "react";
import { StyleSheet, Text, View } from "react-native";

const CreatingHeader = () => {
  <View style={styles.header}>
    <Text style={styles.title}>Group Creation Screen</Text>
  </View>
}

export default CreatingHeader;

const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingTop: 45,
    backgroundColor: "coral",
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
