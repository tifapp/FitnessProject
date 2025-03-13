import { Title } from "@components/Text"
import React, { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated"

// Animated title component
const AnimatedTitle = () => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.9)

  useEffect(() => {
    // Faster title animation
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <Title style={styles.title}>Trial of Gratitude</Title>
    </Animated.View>
  )
}

// Animated item component for bullet points
const AnimatedItem = ({ index }) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.9)

  useEffect(() => {
    // Shorter delays between items (150ms) and shorter initial delay (400ms)
    // This creates more overlap in the animations
    const delay = 400 + (index * 150)

    // Faster animation duration (250ms instead of 300ms)
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    )

    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    }
  })

  return (
    <Animated.View style={[styles.itemRow, animatedStyle]}>
      <View style={styles.bullet} />
      <View style={styles.underline} />
    </Animated.View>
  )
}

export const GratitudeList = () => {
  // Create an array of 9 items
  const items = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1
  }))

  return (
    <View style={styles.container}>
      <AnimatedTitle />

      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <AnimatedItem
            key={item.id}
            index={index}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 40
  },
  listContainer: {
    width: "80%",
    marginTop: 20
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 40
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginRight: 12,
    marginBottom: 3
  },
  underline: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 10
  }
})
