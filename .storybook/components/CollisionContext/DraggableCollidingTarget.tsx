import React from 'react';
import { Text, ViewProps, ViewStyle } from 'react-native';
import { useCollisionContext } from './useCollisionContext';
import { DraggableView } from '@journaling/DraggableView/DraggableView';
import { usePanGesture } from '@journaling/DraggableView/usePanGesture';

export type DraggableCollidingTargetProps = ViewProps & {
  activeStyle?: ViewStyle;
  collidingStyle?: ViewStyle;
};

export const DraggableCollidingTarget = ({ 
  activeStyle,
  collidingStyle,
  style,
  ...props 
}: DraggableCollidingTargetProps) => {
  const localDraggable = usePanGesture();
  const { onAnimatedLayoutChange, onLayout, collidingTargets } = useCollisionContext();

  return (
    <DraggableView
      draggable={{
        ...localDraggable, 
        onLayout,
        onAnimatedLayoutChange,
      }}
      style={[
        style, 
        localDraggable.isPanning === true && activeStyle,
        collidingTargets.length > 1 && collidingStyle
      ]}
      {...props}
    >
      <Text>Drag me!</Text>
    </DraggableView>
  );
}