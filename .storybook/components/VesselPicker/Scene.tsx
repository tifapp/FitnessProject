import { Title } from "@components/Text";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { FadeOut } from "../FadeOut/FadeOut";
import { Mountain } from "../Icons/Mountain";
import { VesselPicker } from "./VesselPicker";

export const VesselPickerScene = ({ onComplete }: { onComplete: (color: string) => void; }) => {
  const [color, setColor] = useState<string>()

  return (
    <SafeAreaView style={styles.container}>
      <Title
        style={{
          alignItems: "center",
          textAlign: "center",
          fontStyle: "italic",
          marginBottom: 600,
        }}
      >
        Please select an avatar.
      </Title>
      <View style={styles.background}>
        <Mountain width={900} height={900}/>
      </View> 
      <VesselPicker onSelect={setColor} />

      <FadeOut 
        trigger={!!color} 
        onComplete={() => onComplete(color!)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
    justifyContent: "flex-start", // Center vertically
    alignItems: "center",
  },
  background: {
    position: "absolute",
    opacity: 0.5,
    bottom: 0,
    zIndex: -10
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject, // Make the overlay cover the entire screen
    backgroundColor: "white", // White background for fade effect
  },
});
