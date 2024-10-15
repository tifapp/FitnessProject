import { Title } from "@components/Text";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { FadeOut } from "../FadeOut/FadeOut";
import { VesselPicker } from "./VesselPicker"; // Adjust the import path as needed

export const VesselPickerScene = ({ onComplete }: { onComplete: (color: string) => void; }) => {
  const [color, setColor] = useState<string>()

  return (
    <SafeAreaView style={styles.container}>
      <Title
        style={{
          alignItems: "center",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Please select an avatar.
      </Title>
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
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject, // Make the overlay cover the entire screen
    backgroundColor: "white", // White background for fade effect
  },
});
