import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function AddPost({ addUserAsync }) {
  const [text, setText] = useState("");

  const changeHandler = (val) => {
    setText(val);
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        multiline={true}
        placeholder="New Post"
        onChangeText={(val) => changeHandler(val)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 30,
  },
});
