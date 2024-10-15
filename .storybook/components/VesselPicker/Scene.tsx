import React from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { VesselPicker } from "./VesselPicker"; // Adjust the import path as needed

export const Scene = ({ onComplete }: {onComplete: () => void;}) => {
  return (
    <View style={styles.container}>
      <VesselPicker
        onSelect={() => setTimeout(onComplete, 1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 100,
  },
});
