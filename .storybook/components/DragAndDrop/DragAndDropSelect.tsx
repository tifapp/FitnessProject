import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { DraggableView } from '../DraggableView/DraggableView';
import { useDragAndDrop } from "./useDragAndDrop";

type DropOption = {
  id: string;
  label: string;
  isValid: boolean;
  position?: {
    bottom: number;
    left: number;
  };
};

type GenericDragAndDropProps = {
  options: DropOption[];
  columns?: number;
  spacing?: {
    vertical: number;
    horizontal: number;
  };
  draggableLabel?: string;
  onSelect?: (option?: DropOption) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export const DragAndDropSelect = ({
  options,
  columns = 3,
  spacing = { vertical: 20, horizontal: 20 },
  draggableLabel = "Drag me!",
  onSelect
}: GenericDragAndDropProps) => {
  const optionIds = options.map(opt => opt.id);
  const dragTargets = useDragAndDrop(optionIds, (id) => 
    onSelect?.(id ? options.find(option => id === option.id) : undefined)
  );
  const { token, ...targets } = dragTargets;
  const windowWidth = Dimensions.get('window').width;

  // Calculate grid dimensions
  const targetSize = 100; // Width and height of each target
  const gridPadding = 20;
  const availableWidth = windowWidth - (gridPadding * 2);
  const itemSpacing = spacing.horizontal;
  const calculatedColumns = Math.min(
    columns,
    Math.floor((availableWidth + itemSpacing) / (targetSize + itemSpacing))
  );
  
  const rows = Math.ceil(options.length / calculatedColumns);

  // Calculate grid container height
  const gridHeight = (rows * (targetSize + spacing.vertical)) - spacing.vertical;

  const calculateGridPosition = (index: number) => {
    const row = Math.floor(index / calculatedColumns);
    const col = index % calculatedColumns;
    
    const totalWidthPerItem = targetSize + spacing.horizontal;
    const totalWidth = (calculatedColumns * totalWidthPerItem) - spacing.horizontal;
    const startX = (windowWidth - totalWidth) / 2;
    
    return {
      left: startX + (col * (targetSize + spacing.horizontal)),
      top: row * (targetSize + spacing.vertical)
    };
  };

  return (
    <View style={[styles.gridContainer, { height: gridHeight + 100 }]}>
      {options.map((option, index) => {
        const position = calculateGridPosition(index);
        return (
          <Animated.View
            key={option.id}
            onLayout={targets[option.id].onLayout}
            style={[
              styles.target,
              styles.blueTarget,
              {
                left: position.left,
                top: position.top,
                width: targetSize,
                height: targetSize,
              },
              token.isPanning && styles.tokenHovered,
              token.isPanning && targets[option.id].isSelecting && styles.targetHovered,
              !token.isPanning && targets[option.id].isSelecting && 
                (option.isValid ? styles.targetSelected : styles.targetInvalid)
            ]}
          >
            <View style={styles.targetInner}>
              <Text>{option.label}</Text>
            </View>
          </Animated.View>
        );
      })}
      
      <DraggableView
        draggable={{
          panGesture: token.panGesture,
          panPosition: token.panPosition
        }}
        style={[
          styles.target,
          styles.draggable,
          token.isPanning && styles.tokenHovered,
          {
            position: 'absolute',
            left: windowWidth / 2 - targetSize / 2,
            bottom: 20,
            width: targetSize,
            height: targetSize,
          }
        ]}
      >
        <Text>{draggableLabel}</Text>
      </DraggableView>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 20,
  },
  target: {
    position: 'absolute',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  targetInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueTarget: {
    backgroundColor: '#bbdefb',
  },
  draggable: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 8,
  },
  tokenHovered: {
    borderWidth: 2,
    borderColor: '#ff0',
  },
  targetHovered: {
    borderWidth: 2,
    borderColor: '#000',
  },
  targetSelected: {
    borderWidth: 2,
    borderColor: '#faf',
  },
  targetInvalid: {
    borderWidth: 2,
    borderColor: '#0af',
  },
});