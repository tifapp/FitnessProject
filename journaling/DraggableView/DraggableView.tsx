import React from 'react';
import { LayoutChangeEvent, ViewProps } from 'react-native';
import { GestureDetector, PanGesture } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { Measurements } from '../HoverContext/types';

export type Draggable = {
  onLayout?: (event: LayoutChangeEvent) => void;
  onAnimatedLayoutChange?: (layout: Partial<Measurements>) => void
  panGesture: PanGesture;
  panPosition: {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };
}

export const DraggableView = ({
  children,
  style,
  draggable: {onLayout, onAnimatedLayoutChange, panGesture, panPosition}
}: ViewProps & {draggable: Draggable}) => {
  const initialLayoutX = useSharedValue<number | null>(null);
  const initialLayoutY = useSharedValue<number | null>(null);

  useAnimatedReaction(
    () => ({
      x: panPosition.x.value,
      y: panPosition.y.value
    }),
    (currentPosition, previousPosition) => {
      if (!initialLayoutX.value || !initialLayoutY.value) return;

      onAnimatedLayoutChange?.({
        x: initialLayoutX.value + (currentPosition.x),
        y: initialLayoutY.value + (currentPosition.y),
      });
    }
  );

  const handleInitialLayout = (event: LayoutChangeEvent) => {
    if (initialLayoutX.value && initialLayoutY.value) return;

    initialLayoutX.value = event.nativeEvent.layout.x;
    initialLayoutY.value = event.nativeEvent.layout.y;
    onLayout?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: panPosition.x.value },
        { translateY: panPosition.y.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        onLayout={handleInitialLayout}
        style={[
          style,
          animatedStyle
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};