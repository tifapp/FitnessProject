import { useScrollContext } from "@components/common/ScrollView"
import { useWindowDimensions } from "react-native"
import { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { DefaultStyle } from "react-native-reanimated/lib/typescript/hook/commonTypes"

export const useAnimatedParallaxStyle = (animatedParallaxStyle: (scrollProgress: SharedValue<number>) => DefaultStyle) => {
  const { scrollY } = useScrollContext()
  const { height: windowHeight } = useWindowDimensions()

  const scrollProgress = useDerivedValue(() => {
    return scrollY.value / windowHeight
  })

  return useAnimatedStyle(() => {
    return animatedParallaxStyle(scrollProgress)
  })
}
