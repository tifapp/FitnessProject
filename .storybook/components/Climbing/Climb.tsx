import React, { useCallback, useRef, useState } from "react"
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
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

const DistanceText = ({ distance }: { distance: number }) => {
  return (
    <Text style={styles.distanceCounter}>
      Distance: {distance.toFixed(2)} feet
    </Text>
  )
}

export function SimpleJumpGame() {
  const [distance, setDistance] = useState(0)
  const boxPosition = useSharedValue(0)
  const boxScale = useSharedValue(1)
  const cameraPosition = useSharedValue(0)
  const backgroundBoxScale = useSharedValue(1)

  const { meter, startMeter: handlePressIn, stopMeter } = useMeter()

  const handlePressOut = () => {
    stopMeter()
    const jumpDistance = meter.value * 2
    const targetPosition = boxPosition.value - jumpDistance

    boxPosition.value = withTiming(targetPosition, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    })

    boxScale.value = withSequence(
      withTiming(0.4, {
        //should depend on distance from camera (current distance - new distance)
        duration: 500,
        easing: Easing.out(Easing.cubic)
      }),
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic)
      })
    )

    setDistance((prev) => prev + jumpDistance)

    cameraPosition.value = withDelay(
      500,
      withTiming(targetPosition, {
        duration: 500,
        easing: Easing.out(Easing.cubic)
      })
    )

    backgroundBoxScale.value = withDelay(
      500,
      withTiming(1.5 + distance / 100, {
        //should also depend on distance from camera
        duration: 500,
        easing: Easing.out(Easing.cubic)
      })
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.hudContainer}>
        <DistanceText distance={distance} />
        <View style={styles.meterContainer}>
          <Animated.View
            style={[
              styles.meter,
              useAnimatedStyle(() => {
                return {
                  width: `${meter.value}%`,
                  backgroundColor: meter.value >= maxMeter ? "red" : "green"
                }
              })
            ]}
          />
        </View>
      </View>
      <Animated.View
        style={[
          styles.scene,
          useAnimatedStyle(() => {
            return {
              transform: [{ translateY: -cameraPosition.value }]
            }
          })
        ]}
      >
        <Animated.View
          style={[
            styles.backgroundBox,
            useAnimatedStyle(() => {
              return {
                transform: [{ scale: backgroundBoxScale.value }]
              }
            })
          ]}
        />
        <Animated.View
          style={[
            styles.character,
            useAnimatedStyle(() => {
              return {
                transform: [
                  { translateY: boxPosition.value },
                  { scale: boxScale.value }
                ]
              }
            })
          ]}
        />
      </Animated.View>
      <Pressable
        style={styles.pressArea}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0"
  },
  hudContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10
  },
  scene: {
    flex: 1,
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
    width: "100%"
  },
  backgroundBox: {
    width: 100,
    height: 100,
    borderWidth: 4,
    borderColor: "black",
    backgroundColor: "transparent",
    zIndex: -1
  },
  character: {
    width: 50,
    height: 50,
    backgroundColor: "blue"
  },
  meterContainer: {
    position: "absolute",
    bottom: 30,
    left: "10%",
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
    fontSize: 24,
    fontWeight: "bold"
  }
})
