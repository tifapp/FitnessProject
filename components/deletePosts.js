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
  deleteUsersAsync,
  userVal,
}) {
  return (
    <View>
      <Text>{userVal}</Text>
      <Text style={styles.check}>{item.name}</Text>
      <Button
        onPress={() => (pressHandler(item.id), deleteUsersAsync(item.id))}
        title="delete"
        color="blue"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    padding: 16,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
});
