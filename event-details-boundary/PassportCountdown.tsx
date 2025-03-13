import React, { useEffect, useState } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"

const PassportCountdown = () => {
  // Example event date - replace with your actual event date
  const eventDate = new Date("2025-03-15T00:00:00")

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Animation for blinking colons
  const [colonOpacity] = useState(new Animated.Value(1))

  useEffect(() => {
    // Timer for countdown
    const calculateTimeLeft = () => {
      const difference = eventDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    // Colon blink animation
    const startBlinking = () => {
      Animated.sequence([
        Animated.timing(colonOpacity, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(colonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start(() => startBlinking())
    }

    startBlinking()

    return () => clearInterval(timer)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>STARTS IN</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Countdown display (without inner border) */}
          <View style={styles.dateContainer}>
            <View style={styles.timeValues}>
              <Text style={styles.timeValue}>{String(timeLeft.days).padStart(2, "0")}</Text>
              <Animated.Text style={[styles.timeValue, styles.colonText, { opacity: colonOpacity }]}>:</Animated.Text>
              <Text style={styles.timeValue}>{String(timeLeft.hours).padStart(2, "0")}</Text>
              <Animated.Text style={[styles.timeValue, styles.colonText, { opacity: colonOpacity }]}>:</Animated.Text>
              <Text style={styles.timeValue}>{String(timeLeft.minutes).padStart(2, "0")}</Text>
            </View>

            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>DAYS</Text>
              <Text style={styles.timeLabelSpacer}></Text>
              <Text style={styles.timeLabel}>HRS</Text>
              <Text style={styles.timeLabelSpacer}></Text>
              <Text style={styles.timeLabel}>MIN</Text>
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
    borderColor: "#B91C1C", // red-700
    maxWidth: 300
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
  timeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B91C1C", // red-700
    fontFamily: "monospace",
    marginHorizontal: 2
  },
  colonText: {
    // Additional styling for the blinking colons
    fontWeight: "900"
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2 // Reduced margin
  },
  timeLabel: {
    width: 32,
    textAlign: "center",
    fontSize: 10,
    color: "#B91C1C" // red-700
  },
  timeLabelSpacer: {
    width: 12
  }
})

export default PassportCountdown
