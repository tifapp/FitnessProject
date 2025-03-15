import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CollisionProvider } from './CollisionContext';
import { DraggableCollidingTarget } from './DraggableCollidingTarget';

export const CollidingContextMeta = {
  title: "CollidingContext",
};

export default CollidingContextMeta;

export const Basic = () => {
  return (
    <CollisionProvider>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.content}>
          <DraggableCollidingTarget
            style={[
              styles.target,
              styles.draggable,
              {
                top: "25%",
                left: "50%"
              }
            ]}
            activeStyle={styles.targetHovered}
            collidingStyle={styles.targetSelecting}
          >
            <Text>Drag me!</Text>
          </DraggableCollidingTarget>
          <DraggableCollidingTarget
            style={[
              styles.target,
              styles.draggable,
              {
                top: "75%",
                left: "50%"
              }
            ]}
            activeStyle={styles.targetHovered}
            collidingStyle={styles.targetSelecting}
          >
            <Text>Drag me!</Text>
          </DraggableCollidingTarget>
        </View>
      </GestureHandlerRootView>
    </CollisionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  draggable: {
    position: 'absolute',
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  target: {
    position: 'absolute',
    width: 100,
    height: 100,
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
  redTarget: {
    backgroundColor: '#ffcdd2',
  },
  blueTarget: {
    backgroundColor: '#bbdefb',
  },
  greenTarget: {
    backgroundColor: '#c8e6c9',
  },
  targetHovered: {
    borderWidth: 2,
    borderColor: '#000',
  },
  targetSelecting: {
    borderWidth: 2,
    borderColor: '#f0f',
  },
});