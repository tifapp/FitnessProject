import React from "react"
import { StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { HoverProvider } from "../HoverContext/HoverContext"
import ShieldDefenseGame from "./ShieldDefense"

export const ShieldDefenseMeta = {
  title: "ShieldDefense"
}

export default ShieldDefenseMeta

export const Basic = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <HoverProvider>
        <ShieldDefenseGame />
      </HoverProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  content: {
    flex: 1,
    position: "relative"
  },
  draggable: {
    position: "absolute",
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  target: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  targetInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  redTarget: {
    backgroundColor: "#ffcdd2"
  },
  blueTarget: {
    backgroundColor: "#bbdefb"
  },
  greenTarget: {
    backgroundColor: "#c8e6c9"
  },
  targetHovered: {
    borderWidth: 2,
    borderColor: "#000"
  },
  hoverIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  }
})
