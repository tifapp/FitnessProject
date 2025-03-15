import { Caption, CaptionTitle, Subtitle } from "@components/Text"
import React, { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated"

// Update component to accept secondsToStart prop
const PassportCountdown = ({ secondsToStart }) => {
  console.log("seconds are ", secondsToStart)

  // Calculate time components from total seconds
  const days = Math.floor(secondsToStart / (60 * 60 * 24))
  const hours = Math.floor((secondsToStart / (60 * 60)) % 24)
  const minutes = Math.floor((secondsToStart / 60) % 60)
  const seconds = Math.floor(secondsToStart % 60)

  // Animation for blinking colons using Reanimated 3
  const colonOpacity = useSharedValue(1)

  useEffect(() => {
    // Set up continuous blinking with Reanimated 3
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1, // Infinite repetition
      false // No reverse
    )

    // No need for the timer anymore since secondsToStart is passed as a prop
    return () => {}
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <CaptionTitle style={styles.headerText}>STARTS IN</CaptionTitle>
          </View>
        </View>

        <View style={styles.content}>
          {/* Countdown display */}
          <View style={styles.dateContainer}>
            <View style={styles.timeValues}>
              {/* Days with label */}
              <View style={styles.timeUnit}>
                <View style={styles.digitContainer}>
                  <Subtitle style={styles.timeValue}>{String(days).padStart(2, "0")}</Subtitle>
                </View>
                <Caption style={styles.unitLabel}>D</Caption>
              </View>

              <ColonText opacity={colonOpacity}>:</ColonText>

              {/* Hours with label */}
              <View style={styles.timeUnit}>
                <View style={styles.digitContainer}>
                  <Subtitle style={styles.timeValue}>{String(hours).padStart(2, "0")}</Subtitle>
                </View>
                <Caption style={styles.unitLabel}>H</Caption>
              </View>

              <ColonText opacity={colonOpacity}>:</ColonText>

              {/* Minutes with label */}
              <View style={styles.timeUnit}>
                <View style={styles.digitContainer}>
                  <Subtitle style={styles.timeValue}>{String(minutes).padStart(2, "0")}</Subtitle>
                </View>
                <Caption style={styles.unitLabel}>M</Caption>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 24,
    zIndex: 50
  },
  card: {
    backgroundColor: "#FFFBEB", // amber-50
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#B91C1C" // red-700
  },
  header: {
    backgroundColor: "#B91C1C", // red-700
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "center", // Center the text
    alignItems: "center"
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold"
  },
  content: {
    padding: 8, // Reduced padding
    borderTopWidth: 1,
    borderTopColor: "#FECACA" // red-200
  },
  dateContainer: {
    alignItems: "center"
  },
  timeValues: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  // Wrapper for digit and its label
  timeUnit: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  // Container for digit to ensure fixed width
  digitContainer: {
    minWidth: 34,
    justifyContent: "center",
    alignItems: "center"
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B91C1C", // red-700
    fontFamily: "monospace"
  },
  // Style for the D/H/M/S labels
  unitLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#B91C1C", // red-700
    marginRight: 2
  },
  colonText: {
    // Additional styling for the blinking colons
    fontWeight: "900",
    fontSize: 20,
    color: "#B91C1C", // red-700
    marginHorizontal: 1
  }
})

// Separate component for the blinking colon
const ColonText = ({ children, opacity }) => {
  // Create animated style based on the opacity shared value
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  return (
    <Animated.Text style={[styles.colonText, animatedStyle]}>
      {children}
    </Animated.Text>
  )
}

export default PassportCountdown
