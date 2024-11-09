import { ReactNode } from "react"
import { View, ViewStyle, StyleProp, StyleSheet } from "react-native"
import { useScreenBottomPadding } from "./Padding"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppStyles } from "@lib/AppColorStyle"
import { useKeyboardState } from "@lib/Keyboard"
import Animated, { AnimatedStyle } from "react-native-reanimated"

export type TiFFooterProps = {
  children: ReactNode
  backgroundStyle?: StyleProp<AnimatedStyle<ViewStyle>>
  style?: StyleProp<ViewStyle>
}

export const TiFFooterView = ({
  children,
  backgroundStyle = styles.defaultBackground,
  style
}: TiFFooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  const isKeyboardPresented = useKeyboardState().isPresented
  const safeArea = useSafeAreaInsets()
  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.footer,
          backgroundStyle,
          {
            paddingBottom: isKeyboardPresented
              ? 24
              : safeArea.bottom + bottomPadding
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  defaultBackground: {
    backgroundColor: AppStyles.cardColor
  }
})
