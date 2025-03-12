import { AvatarMapMarkerView } from "@components/AvatarMapMarker"
import { BalloonIcon } from "@components/Balloon"
import React, { useEffect } from "react"
import { LogBox, StyleProp, View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated"

// Ignore specific warnings by their message
LogBox.ignoreLogs(["Encountered"])

type AnimatedBalloonWithAvatarProps = {
  name: string
  balloonColor?: string
  balloonWidth?: number
  balloonHeight?: number
  style?: StyleProp<ViewStyle>
  avatarScale?: number
  floatAmount?: number
  floatDuration?: number
}

export const AnimatedBalloonWithAvatar = ({
  name,
  balloonColor = "white",
  balloonWidth = 128,
  balloonHeight = 128,
  style,
  avatarScale = 1.5,
  floatAmount = 15,
  floatDuration = 3000
}: AnimatedBalloonWithAvatarProps) => {
  // Animation value for the floating effect
  const floatProgress = useSharedValue(0)

  useEffect(() => {
    // Create a gentle floating animation that repeats indefinitely
    floatProgress.value = withRepeat(
      withTiming(1, {
        duration: floatDuration,
        easing: Easing.inOut(Easing.sin)
      }),
      -1, // Infinite repetition
      true // Reverse the animation
    )
  }, [floatDuration])

  // Create animated style for the float movement
  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate the 0-1 progress to a smooth up and down movement
    const yOffset = interpolate(
      floatProgress.value,
      [0, 0.5, 1],
      [0, -floatAmount, 0], // Move up by floatAmount at midpoint
      Extrapolation.CLAMP
    )

    return {
      transform: [{ translateY: yOffset }]
    }
  })

  return (
    <Animated.View style={[{ zIndex: 101 }, style, animatedStyle]}>
      <BalloonIcon
        width={balloonWidth}
        height={balloonHeight}
        color={balloonColor}
      />
      <View style={{ transform: `scale(${avatarScale})`, top: -116, left: 24 }}>
        <AvatarMapMarkerView
          name={name}
        />
      </View>
    </Animated.View>
  )
}
