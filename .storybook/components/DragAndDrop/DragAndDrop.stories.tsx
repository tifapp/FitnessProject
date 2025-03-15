import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HoverProvider } from '../HoverContext/HoverContext';
import { DragAndDropSelect } from "./DragAndDropSelect";

export const DragAndDropMeta = {
  title: "DragAndDrop",
};

export default DragAndDropMeta;

export const Basic = () => {
  const [header, setHeader] = useState("Where is Paris")

  return (
    <GestureHandlerRootView style={styles.container}>
      <HoverProvider>
        <View style={styles.content}>     
          <Text style={{padding: 100, width:"100%", flex: 0.25, textAlign: "center", alignContent: "center", alignSelf: "center"}}>{header}</Text> 
          <DragAndDropSelect onSelect={(option) => {
            if (option?.isValid) {
              setHeader("RIGHT!")
            }
            if (option?.isValid === false) {
              setHeader("No you dumby")
            }
            if (!option) {
              setHeader("Where is Paris")
            }
          }} options={[{id: "1", label: "Paris", isValid: true}, {id: "2", label: "Kentucky", isValid: false}]} />
        </View>
      </HoverProvider>
    </GestureHandlerRootView>
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
  hoverIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  token: { 
    backgroundColor: '#fff',
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
  }
});