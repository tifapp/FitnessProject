// VesselPicker.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  ViewStyle
} from "react-native";
import { ITEM_SIZE, PickerItem } from "./PickerItem";

// Define the Colors enum
export enum Options {
  Red = "#EF6351",
  Purple = "#CB9CF2",
  Blue = "#88BDEA",
  Green = "#72B01D",
  Pink = "#F7B2BD",
  Orange = "#F4845F",
  Yellow = "#F6BD60",
}

type VesselPickerProps = {
  onSelect: (option: string) => void;
  style?: ViewStyle;
};

const REPEAT_FACTOR = 5 // Number of shuffled blocks

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type Data = { key: string; color: string; rotation: number } 

const data = (() => {
  const repeatedData: Data[] = [];
  for (let i = 0; i < REPEAT_FACTOR; i++) {
    const shuffled = shuffleArray(Object.values(Options));
    shuffled.forEach((color, j) => {
      const rotation = Math.random() > 0.5 ? -75 : 75;
      repeatedData.push({
        key: `${color}-${i}-${j}`,
        color,
        rotation,
      });
    });
  }
  return repeatedData;
})();

export const VesselPicker = ({
  onSelect,
  style,
}: VesselPickerProps) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && data.length > 0) {
      const middleIndex = Math.floor(data.length / 2);
      flatListRef.current.scrollToIndex({
        index: middleIndex,
        animated: false,
      });
    }
  }, [data.length]);

  const handleScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / ITEM_SIZE);
    const buffer = 10;

    if (currentIndex <= buffer || currentIndex >= data.length - buffer) {
      const middleIndex = Math.floor(data.length / 2);
      const newIndex =
        middleIndex + (currentIndex % Object.values(Options).length);
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: newIndex,
          animated: false,
        });
      }
    }
  };

  const renderItem = useMemo(() => {
    return ({ item }: { item: Data }) => {  
      return (
        <PickerItem
          color={item.color}
          rotation={item.rotation}
          onSelect={() => onSelect(item.color)}
        />
      );
    };
  }, [onSelect]);  

  return (
    <>
      <FlatList
        decelerationRate={"fast"}
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        initialNumToRender={Object.values(Options).length * 2}
        windowSize={10}
        style={[style]}
        contentContainerStyle={styles.contentContainer}
        onScrollToIndexFailed={(info: any) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }
          });
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  optionContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
});
