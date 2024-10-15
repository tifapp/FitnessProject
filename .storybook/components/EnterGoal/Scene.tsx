import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { SettingsChecklistPickerView } from "settings-boundary/components/ChecklistPicker";
import { Subtitle, Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Avatar } from "./Avatar";

const WEB_BROWSER_CHECKLIST_OPTIONS = [
  { title: "Tries new activities", value: "in-app" },
  { title: "Exercises consistently", value: "system-default" },
  { title: "Other", value: "other" }
] as const

export const EnterGoalScene = ({ onComplete }: { onComplete: (name: string) => void }) => {
  const [finished, setFinished] = useState(false)
  const [goal, setGoal] = useState<string>("");

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Who do you want to become?</Title>

      <View style={styles.avatarContainer}>
        <Avatar color={"red"} rotation={0} />
      </View>

      <Subtitle style={styles.subtitle}>I'm going to be someone who</Subtitle>
      <SettingsChecklistPickerView
        options={WEB_BROWSER_CHECKLIST_OPTIONS}
        onOptionSelected={(preferredBrowserName) => {
          setGoal(preferredBrowserName)
        }}
        selectedOptions={[goal]}
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
    fontSize: 18, // Optional: Adjust font size
    marginBottom: 20,
  },
  textField: {
    fontSize: 20,
    paddingTop: 4,
    width: "100%"
  },
});
