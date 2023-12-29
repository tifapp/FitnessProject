import React, { useEffect, useRef } from "react"
import {
  Animated,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from "react-native"

export type SkeletonProps = {
  style?: StyleProp<ViewStyle>
} & ViewProps

/**
 * A useful placeholder component for view that's loading.
 */
export const SkeletonView = ({ style, ...props }: SkeletonProps) => {
  const animationRef = useRef(new Animated.Value(0))
  const animationLoop = useRef<Animated.CompositeAnimation>()

  useEffect(() => {
    animationLoop.current = Animated.timing(animationRef.current, {
      toValue: 2,
      delay: 400,
      duration: 1500,
      useNativeDriver: true
    })
    animationRef.current.setValue(0)
    Animated.loop(animationLoop.current).start()
  }, [])

  return (
    <View {...props} accessible={false} style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.skeleton,
          {
            opacity: animationRef.current.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [1, 0, 1]
            })
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#bdbdbd"
  },
  skeleton: {
    height: "100%",
    width: "100%",
    backgroundColor: "#ababab"
  }
})
