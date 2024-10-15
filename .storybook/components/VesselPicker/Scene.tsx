import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { useHaptics } from "../../../modules/tif-haptics";
import { VesselPicker } from "./VesselPicker"; // Adjust the import path as needed

const ITEM_SIZE = 125;
const xSeconds = 2; // Duration to hold before triggering callback

export const Scene = () => {
  const haptics = useHaptics();
  const [selectedItem, setSelectedItem] = useState<{
    color: string;
    layout: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);

  // Animated values
  const otherItemsOpacityAnim = useRef(new Animated.Value(1)).current;

  // For final animation after x seconds
  const selectedItemScaleAnim = useRef(new Animated.Value(1)).current;
  const selectedItemTranslateXAnim = useRef(new Animated.Value(0)).current;
  const selectedItemTranslateYAnim = useRef(new Animated.Value(0)).current;
  const selectedItemRotationAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const handlePress = (option: string) => {
    // Handle simple press if needed
    console.log("Pressed:", option);
  };

  const handleLongPress = (
    option: string,
    itemRef: React.RefObject<any>
  ) => {
    haptics.play({ name: "selection" });
    setSelectedItem(null); // Reset previous selection if any

    // Start fading out other items
    Animated.timing(otherItemsOpacityAnim, {
      toValue: 0,
      duration: xSeconds * 1000,
      useNativeDriver: true,
    }).start();

    // Start hold timer
    holdTimerRef.current = setTimeout(() => {
      if (itemRef.current) {
        itemRef.current.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            setSelectedItem({
              color: option,
              layout: { x, y, width, height },
            });
            startFinalAnimation(option, { x, y, width, height });
          }
        );
      } else {
        startFinalAnimation(option, { x: 0, y: 0, width: ITEM_SIZE, height: ITEM_SIZE });
      }
    }, xSeconds * 1000);
  };

  const startFinalAnimation = (
    option: string,
    layout: { x: number; y: number; width: number; height: number }
  ) => {
    setSelectionConfirmed(true);
    const centerX = screenWidth / 2 - ITEM_SIZE / 2;
    const centerY = screenHeight / 2 - ITEM_SIZE / 2;
    const deltaX = centerX - layout.x;
    const deltaY = centerY - layout.y;

    selectedItemRotationAnim.setValue(0); // Reset rotation if needed
    selectedItemScaleAnim.setValue(1);
    selectedItemTranslateXAnim.setValue(0);
    selectedItemTranslateYAnim.setValue(0);
    backgroundOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(selectedItemScaleAnim, {
        toValue: 2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(selectedItemTranslateXAnim, {
        toValue: deltaX,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(selectedItemTranslateYAnim, {
        toValue: deltaY,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Trigger your callback function here
      colorTapped(option);
    });
  };

  const colorTapped = (option: string) => {
    haptics.play({ name: "selection" });
    // Additional callback logic here
    console.log("Selected Color:", option);
    // Reset animation states if needed
  };

  const handlePressOut = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;

      Animated.timing(otherItemsOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setSelectedItem(null);
        setSelectionConfirmed(false);
      });
    }
  };

  return (
    <View style={styles.container}>
      <VesselPicker
        onPress={handlePress}
        //onLongPress={handleLongPress}
        style={{ opacity: otherItemsOpacityAnim }}
      />
      {selectionConfirmed && selectedItem && (
        <SelectedItemOverlay
          color={selectedItem.color}
          scaleAnim={selectedItemScaleAnim}
          translateXAnim={selectedItemTranslateXAnim}
          translateYAnim={selectedItemTranslateYAnim}
          rotationAnim={selectedItemRotationAnim}
          backgroundOpacityAnim={backgroundOpacityAnim}
          layout={selectedItem.layout}
        />
      )}
      {/* Handle press out globally if needed */}
      {/* You might need to wrap VesselPicker in a Touchable component or handle gesture recognizers */}
    </View>
  );
};

const SelectedItemOverlay = ({
  color,
  scaleAnim,
  translateXAnim,
  translateYAnim,
  rotationAnim,
  backgroundOpacityAnim,
  layout,
}: {
  color: string;
  scaleAnim: Animated.Value;
  translateXAnim: Animated.Value;
  translateYAnim: Animated.Value;
  rotationAnim: Animated.Value;
  backgroundOpacityAnim: Animated.Value;
  layout: { x: number; y: number; width: number; height: number };
}) => {
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          opacity: backgroundOpacityAnim,
        },
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          left: layout.x,
          top: layout.y,
          width: layout.width,
          height: layout.height,
          alignItems: "center",
          justifyContent: "center",
          transform: [
            { translateX: translateXAnim },
            { translateY: translateYAnim },
            { scale: scaleAnim },
            {
              rotate: rotationAnim.interpolate({
                inputRange: [-180, 180],
                outputRange: ["-180deg", "180deg"],
              }),
            },
          ],
        }}
      >
        <Ionicons name="accessibility" color={color} size={90} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
