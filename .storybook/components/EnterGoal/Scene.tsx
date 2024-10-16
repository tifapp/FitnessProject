import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Mountain } from "../Icons/Mountain";
import { VesselPicker } from "../VesselPicker/VesselPickerDiscrete";

export const EnterGoalScene = ({ onComplete }: { onComplete: (name: string) => void }) => {
  const [held, setHeld] = useState(false)
  const [goal, setGoal] = useState<string>("");

  return (
    <SafeAreaView style={styles.container}>
      <Title>Who do you want to be?</Title>
      <Title style={{opacity: held ? 1 : 0}}>Hold still.</Title>

      <View style={styles.background}>
        <Mountain width={900} height={900}/>
      </View> 

      {/* <View style={styles.space} /> */}

      <VesselPicker onSelect={setGoal} />
      
      <FadeOut 
        trigger={goal != ""} 
        onComplete={() => onComplete(goal!)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  space: {
    margin: 50,
  },
  container: {
    flex: 1,
    marginVertical: 100,
    justifyContent: "flex-start", // Center vertically
    alignItems: "center",
  },
  background: {
    position: "absolute",
    opacity: 0.5,
    top: 300,
  },
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 24, // Optional: Adjust font size
    marginBottom: 150, // Spacing below the title
    paddingHorizontal: 50,
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
