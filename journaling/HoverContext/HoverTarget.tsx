import React from 'react';
import { ViewProps, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useHoverContext } from './useHoverContext';

export type DragTargetProps = ViewProps & {
  activeStyle?: ViewStyle;
  selectingStyle?: ViewStyle;
};

export const DragTarget = ({ 
  activeStyle,
  selectingStyle,
  style,
  ...props 
}: DragTargetProps) => {
  const { onLayout, isHovering, isSelecting } = useHoverContext();

  return (
    <Animated.View
      onLayout={onLayout}
      style={[style, 
        isSelecting && !isHovering && selectingStyle,
        isSelecting && isHovering && activeStyle]}
      {...props} 
    />
  );
}