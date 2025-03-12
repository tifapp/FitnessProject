import { Title } from "@components/Text"
import { TimeOfDayView } from "@event-details-boundary/TimeOfDay"
import EventItem from "@journaling/OrbitList/EventItem"
import { sampleEvents } from "@journaling/OrbitList/MockEvents"
import VirtualizedOrbit from "@journaling/OrbitList/VirtualizedOrbit"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { AnimatedBalloonWithAvatar } from "./AvatarBalloon"

export type HomeProps = {
  style?: StyleProp<ViewStyle>
}

const date = new Date()
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
}

const formattedDate = date.toLocaleDateString("en-US", options)
  .replace(", ", "\n")

export const Page1 = () => {
  return (
    <>
      <TimeOfDayView />
      <View style={styles.todo}>
        <View style={{ position: "absolute", top: "10%" }}>
          <Title style={{ color: "black", textAlign: "center" }}>{formattedDate}</Title>
        </View>
        <AnimatedBalloonWithAvatar style={{ position: "absolute", bottom: 150, left: 32 }} name={"Bobby Dhillon"} />
        <VirtualizedOrbit
          positionX={250}
          positionY={700}
          centerElement={<View style={{ left: "-50%", top: "-50%", width: 1000, height: 1000, borderRadius: 500, backgroundColor: AppStyles.primaryBlue.toString() }} />}
          keyExtractor={(item) => item.id}
          data={sampleEvents}
          orbitRadius={600}
          renderItem={(item, position, state) => (
            <EventItem item={item} position={position} state={state} />
          )}
        />
      </View>
    </>
  )
}

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
