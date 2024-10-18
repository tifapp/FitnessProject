// Carousel.tsx
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { PickerItem } from "./PickerItem";

// Define the Colors and Personas
const options = [
  { color: '#CB9CF2', persona: 'Yogi' },
  { color: '#88BDEA', persona: 'Marathon Runner' },
  { color: '#72B01D', persona: 'Weightlifter' },
  { color: '#F7B2BD', persona: 'High-Intensity Athlete' },
  { color: '#F4845F', persona: 'Long-Distance Hiker' }
];

type CarouselProps = {
  onStart: (option: string) => void;
  onEnd: (option: string) => void;
  onComplete: (_: [color: string, option: string]) => void;
  style?: ViewStyle;
};

const ITEM_WIDTH = 200;
const ITEM_MARGIN = 10;
const totalItemWidth = ITEM_WIDTH + ITEM_MARGIN * 2;

// Calculate snap offsets for each item
const snapOffsets = options.map((_, index) => {
  return index * totalItemWidth;
});

export const Carousel = ({ onComplete, onStart, onEnd, style }: CarouselProps) => {
  const { width: windowWidth } = Dimensions.get('window');
  const sidePadding = (windowWidth - ITEM_WIDTH) / 2;

  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // State to track if carousel is disabled
  const [isDisabled, setIsDisabled] = useState(false);

  // Handler when any PickerItem completes
  const handleComplete = (color: string, persona: string) => {
    if (!isDisabled) {
      setIsDisabled(true); // Disable further interactions
      onComplete([color, persona]); // Call the passed onComplete handler
    }
  };

  // Handler when PickerItem starts progress
  const handleStart = (persona: string) => {
    if (!isDisabled) {
      onStart(persona);
    }
  };

  // Handler when PickerItem ends (gesture canceled or completed)
  const handleEnd = (persona: string) => {
    if (!isDisabled) {
      onEnd(persona);
    }
  };

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scrollView, style]}
      contentContainerStyle={{
        paddingHorizontal: sidePadding,
      }}
      snapToOffsets={snapOffsets}
      snapToAlignment="center"
      decelerationRate="fast"
      pagingEnabled={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      scrollEnabled={!isDisabled} // Disable scrolling when isDisabled is true
    >
      {options.map(({ color, persona }, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const scale = interpolate(
            scrollX.value,
            snapOffsets.map((offset) => offset),
            snapOffsets.map((offset, idx) => (idx === index ? 1 : 0.8)),
            Extrapolate.CLAMP
          );

          return {
            transform: [{ scale }],
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              {
                width: ITEM_WIDTH,
                marginHorizontal: ITEM_MARGIN,
                backgroundColor: "transparent",
                overflow: "visible",
              },
              animatedStyle,
            ]}
          >
            <PickerItem 
              color={color} 
              persona={persona} 
              onEnd={() => handleEnd(persona)}
              onProgressStart={() => handleStart(persona)}
              onProgressComplete={() => handleComplete(color, persona)}
              disabled={isDisabled} // Pass the disabled state if you modify PickerItem
            />
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    // Customize your ScrollView style if needed
  },
});
