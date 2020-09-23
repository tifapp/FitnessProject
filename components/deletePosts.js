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

  return (
    <View>
      <View style={styles.spaceAround}>
        <Text>{item.email}</Text>
        <Text style={styles.check}>{item.name}</Text>
      </View>

      {val ? (
        <Button
          onPress={() => (pressHandler(item.id), deletePostsAsync(item.id))}
          title="delete"
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
