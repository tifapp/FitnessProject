import React, { createContext, ReactNode, useContext } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps
} from "react-native-keyboard-aware-scroll-view"
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated"
import { DefaultStyle } from "react-native-reanimated/lib/typescript/hook/commonTypes"

const ScrollContext = createContext<{
  scrollY: SharedValue<number>
}>({
  scrollY: { value: 0 } as SharedValue<number>
})
export const useTiFScroll = () => useContext(ScrollContext)

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
)

export type TiFScrollViewProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
} & Omit<KeyboardAwareScrollViewProps, "contentContainerStyle">

export const TiFScrollView = ({
  children,
  style,
  contentContainerStyle,
  ...props
}: TiFScrollViewProps) => {
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    }
  })

  return (
    <View style={style}>
      <ScrollContext.Provider value={{ scrollY }}>
        <AnimatedKeyboardAwareScrollView
          style={[styles.scroll, style]}
          contentContainerStyle={[
            styles.contentContainer,
            contentContainerStyle
          ]}
          enableResetScrollToCoords={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          bounces={true}
          extraScrollHeight={100} // NB: Gives extra space below keyboard
          enableOnAndroid={true} // NB: Enable keyboard handling on Android too
          {...props}
        >
          {children}
        </AnimatedKeyboardAwareScrollView>
      </ScrollContext.Provider>
    </View>
  )
}

export const useAnimatedParallaxStyle = (
  animatedParallaxStyle: (scrollOffset: SharedValue<number>) => DefaultStyle
) => {
  const { scrollY } = useTiFScroll()

  const scrollOffset = useDerivedValue(() => {
    return scrollY.value
  })

  return useAnimatedStyle(() => {
    return animatedParallaxStyle(scrollOffset)
  })
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 32,
    rowGap: 32
  },
  scroll: {
    height: "100%"
  }
})
