import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";

export default function DeleteItem({
  item,
  pressHandler,
  deletePostsAsync,
  emailVal,
}) {
  const val = emailVal === item.email;
  const months = [
    "January",
    "Febuary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <View>
      <View style={styles.spaceAround}>
        <Text>{item.email}</Text>
        <Text>
          {months[item.month]}-{item.day}-{item.year} {item.hour}:{item.minute}{" "}
          {item.timeOfDay}
        </Text>
        <Text style={styles.check}>{item.name}</Text>
      </View>

      {val ? (
        <Button
          onPress={() => (pressHandler(item.id), deletePostsAsync(item.id))}
          title="Delete"
          color="blue"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    padding: 25,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
  spaceAround: {
    padding: 25,
  },
});
