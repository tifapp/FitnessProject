import React, { useState } from 'react';
import {
  Dimensions,
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

export type Option = {color: string, persona: string}

const options = [
  { color: '#CB9CF2', persona: 'Yogi' },
  { color: '#88BDEA', persona: 'Marathon Runner' },
  { color: '#72B01D', persona: 'Weightlifter' },
  { color: '#F7B2BD', persona: 'High-Intensity Athlete' },
  { color: '#F4845F', persona: 'Long-Distance Hiker' }
] satisfies Option[];

type CarouselProps = {
  onStart: () => void;
  onEnd: () => void;
  onComplete: (_: Option) => void;
  style?: ViewStyle;
};

const ITEM_WIDTH = 200;
const ITEM_MARGIN = 10;
const totalItemWidth = ITEM_WIDTH + ITEM_MARGIN * 2;

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

  const [isDisabled, setIsDisabled] = useState(false);

  const handleComplete = (option: Option) => {
    if (!isDisabled) {
      setIsDisabled(true);
      onComplete(option);
    }
  };

  const handleStart = () => {
    if (!isDisabled) {
      onStart();
    }
  };

  const handleEnd = () => {
    if (!isDisabled) {
      onEnd();
    }
  };

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={{ paddingHorizontal: sidePadding, }}
      snapToOffsets={snapOffsets}
      snapToAlignment="center"
      decelerationRate="fast"
      pagingEnabled={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      scrollEnabled={!isDisabled}
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
              onEnd={() => handleEnd()}
              onProgressStart={() => handleStart()}
              onProgressComplete={() => handleComplete({color, persona})}
              disabled={isDisabled}
            />
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
};
