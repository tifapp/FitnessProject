// ParentComponent.tsx
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Subtitle } from "../../../components/Text";
import { Cloud } from "../Icons/Cloud";
import { Doll, DollRef } from './AliveVessel'; // Ensure correct import path

export const ITEM_SIZE = 125;
export const PROGRESS_DURATION = 10000; // You can adjust this as needed

type PickerItemProps = {
  color: string;
  persona: string;
  onProgressStart?: () => void;
  onProgressComplete?: () => void;
};

export const PickerItem = ({
  color,
  persona,
  onProgressStart = () => {},
  onProgressComplete = () => {},
}: PickerItemProps) => {
  const dollRef = useRef<DollRef>(null);
  
  const gesture = Gesture.LongPress()
    .minDuration(100)
    .maxDistance(20)
    .onStart(() => {
      dollRef.current?.handleGestureStart();
      onProgressStart(); // Optionally trigger progress start
    })
    .onEnd(() => {
      dollRef.current?.handleGestureEnd();
      onProgressComplete(); // Optionally trigger progress completion
    });

  return (
    <GestureDetector gesture={gesture}>
      <View 
        style={styles.container}
      >
        <Cloud style={{ width: ITEM_SIZE + 120, height: ITEM_SIZE + 120 }} />
        <Doll
          ref={dollRef}
          color={color}
          rotation={0}
          opacity={1}
        />
        <Subtitle style={styles.subtitle}>
          {persona}
        </Subtitle>
      </View>
    </GestureDetector>
  );
};

// Styles for PickerItem
const styles = StyleSheet.create({
  container: {
    paddingTop: 150,
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  subtitle: {
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: "transparent",
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 5,
    backgroundColor: 'lightgray',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green',
  },
});
