import { Audio } from 'expo-av';
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { Title } from "../../../components/Text";
import { useHaptics } from '../../../modules/tif-haptics';
import { FadeOut } from "../FadeOut/FadeOut";
import { createThudPattern } from '../Haptics';
import { Mountain } from "../Icons/Mountain";
import { Carousel } from "./Carousel";

async function playSound() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/fall.mp3') // Path to your audio file
  );
  await sound.playAsync();
  return sound;
}

export const EnterGoalScene = ({ onComplete }: { onComplete: (_: [color: string, name: string]) => void }) => {
  const haptics = useHaptics();
  const [held, setHeld] = useState(false)
  const [goal, setGoal] = useState<[string, string]>();
  
  const [sound, setSound] = useState<any>();

  useEffect(() => {
    if (goal) {
      playSound()
      setTimeout(() => {haptics.playCustomPattern(createThudPattern())}, 2500)
    }
  }, [goal])

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Unload the sound when the component unmounts
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Title>Who do you want to be?</Title>
      <Title style={{opacity: held ? 1 : 0}}>Hold still.</Title>

      <View style={styles.background}>
        <Mountain width={900} height={900}/>
      </View> 

      <Carousel style={{backgroundColor: "transparent"}} onEnd={() => setHeld(false)} onComplete={setGoal} onStart={() => setHeld(true)} />
      
      <FadeOut 
        trigger={!!goal} 
        onComplete={() => onComplete(goal!)} 
        delay={2000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  space: {
    margin: 50,
  },
  container: {
    flex: 1,
    marginTop: 100,
    justifyContent: "flex-start", // Center vertically
    alignItems: "center",
    overflow: "visible"
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
