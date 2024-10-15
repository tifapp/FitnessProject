import React from "react";
import { StyleSheet, View } from "react-native";
import { Title } from "../../../components/Text";

export const EnterNameScene = ({ onComplete }: {onComplete: () => void;}) => {
  return (
    <View style={styles.container}>
      <Title
        style={{
          alignItems: "center",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Who are you?
      </Title>
      <Title
        style={{
          alignItems: "center",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        My name is ____
      </Title>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
  },
});
