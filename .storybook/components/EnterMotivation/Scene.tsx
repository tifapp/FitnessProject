import { EventColors } from "@lib/events";
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Avatar, AvatarRef } from "./Avatar";

export const EnterMotivationScene = ({ goal, onComplete }: { goal: string, onComplete: (name: string) => void }) => {
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState<string>("");

  // Create a ref for the Avatar component
  const avatarRef = useRef<AvatarRef>(null);

  // Handler for text input changes
  const handleChangeText = (text: string) => {
    setName(text);
    avatarRef.current?.wiggle(); // Trigger the wiggle animation
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Why do you want to be {goal}?</Title>

      <View style={styles.avatarContainer}>
        <Avatar color={EventColors.Orange} rotation={75} ref={avatarRef} />
      </View>

      <TextInput
        textAlign="center"
        style={styles.textField}
        autoFocus={true}
        value={name}
        multiline={true}
        onChangeText={handleChangeText} // Use the handler
        returnKeyType="done"
        onSubmitEditing={() => setFinished(true)}
      />
      
      <FadeOut 
        trigger={finished} 
        onComplete={() => onComplete(name)} 
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
    fontSize: 18, // Optional: Adjust font size
  },
  textField: {
    fontSize: 20,
    paddingTop: 4,
    width: "100%"
  },
});
