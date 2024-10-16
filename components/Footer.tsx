import { ReactNode } from "react"
import { View, ViewStyle, StyleProp, StyleSheet } from "react-native"
import { useScreenBottomPadding } from "./Padding"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppStyles } from "@lib/AppColorStyle"
import { useKeyboardState } from "@lib/Keyboard"

export type TiFFooterProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const TiFFooterView = ({ children, style }: TiFFooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  const isKeyboardPresented = useKeyboardState().isPresented
  const safeArea = useSafeAreaInsets()
  return (
    <View style={style}>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: isKeyboardPresented
              ? 24
              : safeArea.bottom + bottomPadding
          }
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    paddingTop: 16,
    paddingHorizontal: 24,
    backgroundColor: AppStyles.cardColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  }
})
