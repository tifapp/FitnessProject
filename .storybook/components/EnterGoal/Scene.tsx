import { useSFX } from "@lib/Audio";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Title } from "../../../components/Text";
import { useHaptics } from '../../../modules/tif-haptics';
import { FadeOut } from "../FadeOut/FadeOut";
import { Mountain } from "../Icons/Mountain";
import { Carousel, Option } from "./Carousel";

export const EnterGoalScene = ({ onComplete, onStart, onEnd }: { onStart?: () => void, onEnd?: () => void, onComplete: (_: Option) => void }) => {
  const haptics = useHaptics();
  const [held, setHeld] = useState(false)
  const [goal, setGoal] = useState<Option>();
  
  const {sound} = useSFX(require('../../assets/fall.mp3'));

  useEffect(() => {
    if (goal) {
      sound?.playAsync()
      setTimeout(haptics.playThud, 3000)
    }
  }, [goal])

  return (
    <View style={styles.container}>
      <Title>Who do you want to be?</Title>
      <Title style={{opacity: held ? 1 : 0}}>Hold still.</Title>

      <View style={styles.background}>
        <Mountain width={900} height={900}/>
      </View> 

      <Carousel 
        style={{backgroundColor: "transparent"}}
        onStart={() => {onStart?.(); setHeld(true)}} 
        onEnd={() => {onEnd?.(); setHeld(false)}} 
        onComplete={setGoal} 
      />
      
      <FadeOut 
        trigger={!!goal} 
        onComplete={() => onComplete(goal!)} 
        delay={2500}
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
    justifyContent: "flex-start",
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
    fontSize: 24, 
    marginBottom: 150, 
    paddingHorizontal: 50,
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  textField: {
    fontSize: 20,
    paddingTop: 4,
    width: "100%"
  },
});
