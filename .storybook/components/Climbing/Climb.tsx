import React, { useCallback, useRef, useState } from "react"
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const speed = 0.0004
const maxMeter = 100

function calculateMeter(startTime: number): number {
  const elapsedTime = Date.now() - startTime
  let normalizedTime = elapsedTime * speed

  normalizedTime = Math.min(normalizedTime, 1)

  const meterValue = maxMeter * (1 - Math.pow(1 - normalizedTime, 5))

  return meterValue
}

function useMeter() {
  const meter = useSharedValue(0)
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const updateMeter = () => {
    if (startTimeRef.current !== null) {
      meter.value = calculateMeter(startTimeRef.current)
      animationFrameRef.current = requestAnimationFrame(updateMeter)
    }
  }

  const startMeter = useCallback(() => {
    startTimeRef.current = Date.now()
    meter.value = 0
    updateMeter()
  }, [meter])

  const stopMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    cancelAnimation(meter)
    meter.value = calculateMeter(startTimeRef.current || Date.now())
    startTimeRef.current = null

    meter.value = 0
  }, [meter])

  return { meter, startMeter, stopMeter }
}

export function SimpleJumpGame() {
  const [distance, setDistance] = useState(0)
  const boxPosition = useSharedValue(0)
  const cameraPosition = useSharedValue(0)
  const cameraScale = useSharedValue(1)

  const { meter, startMeter, stopMeter } = useMeter()

  const handlePressIn = startMeter

  const handlePressOut = () => {
    stopMeter()
    const jumpDistance = meter.value * 2

    boxPosition.value = withTiming(boxPosition.value - jumpDistance, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    })

    setDistance((prev) => prev + jumpDistance)

    cameraPosition.value = withDelay(
      500,
      withTiming(boxPosition.value, {
        duration: 500,
        easing: Easing.out(Easing.cubic)
      })
    )
  }

  const meterStyle = useAnimatedStyle(() => {
    return {
      width: `${meter.value}%`,
      backgroundColor: meter.value >= maxMeter ? "red" : "green"
    }
  })

  const boxStyle = useAnimatedStyle(() => {
    const derivedScale = 1 - Math.abs(boxPosition.value) / 1000
    return {
      transform: [{ translateY: boxPosition.value }, { scale: derivedScale }]
    }
  })

  const cameraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cameraPosition.value },
        { scale: cameraScale.value }
      ]
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, cameraStyle]}>
        <View style={styles.rowsContainer}>
          <View style={styles.rowOfBoxes} />
          <View style={styles.rowOfBoxes} />
          <View style={styles.rowOfBoxes} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.character, boxStyle]} />
      <View style={styles.meterContainer}>
        <Animated.View style={[styles.meter, meterStyle]} />
      </View>
      <Pressable
        style={styles.pressArea}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
      <Text style={styles.distanceCounter}>
        Distance: {Math.floor(distance)} units
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center"
  },
  background: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  rowsContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    height: "100%"
  },
  rowOfBoxes: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: SCREEN_WIDTH
  },
  character: {
    width: 50,
    height: 50,
    backgroundColor: "blue",
    position: "absolute"
  },
  meterContainer: {
    position: "absolute",
    bottom: 100,
    width: "80%",
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10
  },
  meter: {
    height: "100%",
    backgroundColor: "green",
    borderRadius: 10
  },
  pressArea: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  distanceCounter: {
    position: "absolute",
    top: 50,
    left: 20,
    fontSize: 24,
    fontWeight: "bold"
  }
})
