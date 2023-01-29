import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function NearbyActivities() {

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>Nearby Activities</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '8%',
    flexDirection: 'column'
  },
  scrollContainer: {
    justifyContent: 'center',
    flex: 1
  },
  text: {
    fontSize: 20,
    paddingLeft: '3%'
  }
});
