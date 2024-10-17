import { EventColors } from "@lib/events";
import { useHaptics } from "@modules/tif-haptics";
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Avatar, AvatarRef } from "./Avatar";
import { createRoarPattern } from "../Haptics";

export const EnterMotivationScene = ({ goal, onComplete }: { goal: string, onComplete: (text: string) => void }) => {
  const haptics = useHaptics();
  const [finished, setFinished] = useState(false);
  const [text, setText] = useState("");
  const placeholderText = `I will be a ${goal}.`;
  
  const avatarRef = useRef<AvatarRef>(null);

  const handleChangeText = (text: string) => {
    setText(text);
    avatarRef.current?.pulse();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Are you sure you'll become a {goal}?</Title>

      <View style={styles.avatarContainer}>
        <View style={[styles.avatarContainer, {position: "absolute", opacity: 0.1, gap: 100, paddingLeft: -50, paddingBottom: 0}]}>
          <Avatar color={EventColors.Orange} rotation={70} />
          <Avatar color={EventColors.Orange} rotation={-80} />
        </View>
        <Avatar color={EventColors.Orange} rotation={-73} />
        <Avatar color={EventColors.Orange} rotation={-75} ref={avatarRef} />
        <Avatar color={EventColors.Orange} rotation={72} />
      </View>
      <View style={{borderBottomWidth: 2, width: "100%", marginBottom: 20, marginTop: -20}}/>

      <View style={styles.inputWrapper}>
        <Text style={styles.placeholderText}>{placeholderText}</Text>
        <TextInput
          style={styles.textField}
          autoFocus={true}
          value={text}
          onChangeText={handleChangeText}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (text.trim() === placeholderText.trim()) {
              avatarRef.current?.standUp()
              haptics.playCustomPattern(createRoarPattern())
              setFinished(true);
            }
          }}
        />
      </View>

      <FadeOut 
        trigger={finished} 
        onComplete={() => onComplete(text)} 
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
    width: 400,
    position: 'relative',
    backgroundColor: "transparent",
  },
  placeholderText: {
    position: 'absolute',
    top: 12,
    left: 30,
    fontSize: 24,
    color: 'gray',
    backgroundColor:"transparent"
  },
  textField: {
    fontSize: 24,
    paddingTop: 12,
    paddingHorizontal: 30,
    width: '100%',
    backgroundColor: 'transparent',
    color: 'black',
  },
});
