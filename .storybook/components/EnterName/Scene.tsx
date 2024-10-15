import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { Subtitle, Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Avatar } from "./Avatar";

export const EnterNameScene = ({ onComplete }: { onComplete: (name: string) => void }) => {
  const [finished, setFinished] = useState(false)
  const [name, setName] = useState<string>("");

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Who are you?</Title>

      <View style={styles.avatarContainer}>
        <Avatar color={"red"} rotation={0} />
      </View>

      <Subtitle style={styles.subtitle}>My name is</Subtitle>
      <TextInput
        textAlign="center"
        style={[styles.textField]}
        autoFocus={true}
        value={name}
        onChangeText={setName}
        returnKeyType="done"
        onSubmitEditing={() => setFinished(true)}
      />
      
      <FadeOut 
        trigger={finished} 
        onComplete={() => onComplete(name!)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
    backgroundColor: "#fff", // Optional: Set a background color
    justifyContent: "flex-start", // Center vertically
    alignItems: "center",
  },
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 24, // Optional: Adjust font size
    marginBottom: 150, // Spacing below the title
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20, // Spacing below the avatar
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    marginRight: 8, // Spacing between subtitle and text field
    fontSize: 18, // Optional: Adjust font size
  },
  textField: {
    fontSize: 20,
    paddingTop: 4,
    width: "100%"
  },
});
