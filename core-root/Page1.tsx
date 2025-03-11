import { TimeOfDayView } from "@event-details-boundary/TimeOfDay"
import ConfigurableOrbitalComponent from "@journaling/OrbitList/AviationTheme"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type HomeProps = {
  style?: StyleProp<ViewStyle>
}

export const Page1 = () => (
  <>
    <TimeOfDayView />
    <View style={styles.todo}>
      <ConfigurableOrbitalComponent />
    </View>
  </>
)

const styles = StyleSheet.create({
  todo: {
    flex: 1,
    display: "flex",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "absolute"
  },
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
  targetSelecting: {
    borderWidth: 2,
    borderColor: "#f0f"
  }
})
