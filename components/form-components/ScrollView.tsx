import { StyleSheet } from "react-native"
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps
} from "react-native-keyboard-aware-scroll-view"
import Animated from "react-native-reanimated"

export type TiFFormScrollViewProps = Omit<
  KeyboardAwareScrollViewProps,
  "contentContainerStyle"
> & {
  onScroll?: any // Type for Reanimated scroll handler
  scrollEventThrottle?: number
}

// Create an Animated version of KeyboardAwareScrollView
const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView)

export const TiFFormScrollView = ({
  children,
  style,
  onScroll,
  scrollEventThrottle,
  ...props
}: TiFFormScrollViewProps) => {
  return (
    <AnimatedKeyboardAwareScrollView
      style={[style, styles.scroll]}
      contentContainerStyle={styles.contentContainer}
      enableResetScrollToCoords={false}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle || 16}
      showsVerticalScrollIndicator={true}
      bounces={true}
      extraScrollHeight={100} // Gives extra space below keyboard
      enableOnAndroid={true} // Enable keyboard handling on Android too
      {...props}
    >
      {children}
    </AnimatedKeyboardAwareScrollView>
  )
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
