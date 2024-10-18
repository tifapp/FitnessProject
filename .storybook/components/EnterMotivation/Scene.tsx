import { EventColors } from "@lib/events";
import { useHaptics } from "@modules/tif-haptics";
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { createRoarPattern } from "../Haptics";
import { Avatar, AvatarRef } from "./Avatar";

async function playSound() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/wind.mp3'), // Path to your audio file
    { volume: 0.5 }
  );
  await sound.playAsync();
  return sound;
}

export const EnterMotivationScene = ({ color, goal, onComplete }: { color: string, goal: string, onComplete: (text: string) => void }) => {
  const [sound, setSound] = useState<any>();

  useEffect(() => {
    playSound().then(sound => 
      setSound(sound)
    )
  }, [])
  
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Unload the sound when the component unmounts
        }
      : undefined;
  }, [sound]);

  const haptics = useHaptics();
  const [finished, setFinished] = useState(false);
  const [text, setText] = useState("");
  const placeholderText = `I will be a ${goal}.`;
  
  const avatarRef = useRef<AvatarRef>(null);

  const handleChangeText = (newText: string) => {
    setText(newText);
    if (newText.length > text.length && placeholderText.startsWith(newText)) {
      avatarRef.current?.pulse();
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      // Simulate the submit when Enter key is pressed
      if (text.trim() === placeholderText.trim()) {
        avatarRef.current?.standUp();
        haptics.playCustomPattern(createRoarPattern());
        setFinished(true);
        Keyboard.dismiss(); // Dismiss the keyboard after submission
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Are you sure you'll become a {goal}?</Title>

      <View style={styles.avatarContainer}>
        <View style={[styles.avatarContainer, {position: "absolute", opacity: 0.1, gap: 100, paddingLeft: -50, paddingBottom: 0}]}>
          <Avatar color={color ?? EventColors.Orange} rotation={70} />
          <Avatar color={color ?? EventColors.Orange} rotation={-80} />
        </View>
        <Avatar color={color ?? EventColors.Orange} rotation={-73} />
        <Avatar color={color ?? EventColors.Orange} rotation={-75} ref={avatarRef} />
        <Avatar color={color ?? EventColors.Orange} rotation={72} />
      </View>
      <View style={{borderBottomWidth: 2, width: "100%", marginBottom: 20, marginTop: -20}}/>

      <View style={styles.inputWrapper}>
        <Text style={styles.placeholderText}>{placeholderText}</Text>
        <TextInput
          style={styles.textField}
          autoFocus={true}
          multiline={true} // Allow text to wrap
          value={text}
          onChangeText={handleChangeText}
          returnKeyType="done"
          onKeyPress={handleKeyPress} // Handle the key press
        />
      </View>

      <FadeOut 
        trigger={finished} 
        onComplete={() => {sound.stopAsync(); onComplete(text)}} 
        delay={2000}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    marginBottom: 150,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    gap: 70,
    paddingLeft: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: "transparent",
    marginHorizontal: 30,
  },
  placeholderText: {
    paddingTop: 5,
    fontSize: 24,
    color: 'gray',
    backgroundColor:"transparent"
  },
  textField: {
    position: 'absolute',
    fontSize: 24,
    width: '100%',
    backgroundColor: 'transparent',
    color: 'black'
  },
});
