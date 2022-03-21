import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function MaxUsers({ setTotalUsers, totalUsersVal }) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text>Max amount of Users: </Text>
        <TextInput
          multine="true"
          onChangeText={setTotalUsers}
          keyboardType={"numeric"}
          placeholder="Enter # of users"
          value={totalUsersVal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 30,
    paddingBottom: 15,
  },
});
