import React from 'react';
import {
  Dimensions,
  StyleSheet,
  ViewStyle
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { PickerItem } from "./PickerItem";

// Define the Colors enum
const options = [
  { color: '#CB9CF2', persona: 'Yogi' },
  { color: '#88BDEA', persona: 'Marathon Runner' },
  { color: '#72B01D', persona: 'Weightlifter' },
  { color: '#F7B2BD', persona: 'HIIT Athlete' },
  { color: '#F4845F', persona: 'Climber/Hiker' }
];

type CarouselProps = {
  onStart: (option: string) => void;
  onEnd: (option: string) => void;
  onComplete: (option: string) => void;
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
      >
        {options.map(({color, persona}, index) => {
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
                  overflow: "visible"
                },
                animatedStyle,
              ]}
            >
              <PickerItem 
                color={color} 
                persona={persona} 
                onEnd={() => onEnd(persona)}
                onProgressStart={() => onStart(persona)}
                onProgressComplete={() => onComplete(persona)}
              />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    //backgroundColor: "red",
  },
});
