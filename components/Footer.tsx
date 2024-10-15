import { ReactNode } from "react"
import { View, ViewStyle, StyleProp, StyleSheet } from "react-native"
import { useScreenBottomPadding } from "./Padding"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppStyles } from "@lib/AppColorStyle"

export type TiFFooterProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const TiFFooterView = ({ children, style }: TiFFooterProps) => {
  const bottomPadding = useScreenBottomPadding({
    safeAreaScreens: 8,
    nonSafeAreaScreens: 24
  })
  return (
    <View style={style}>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: useSafeAreaInsets().bottom + bottomPadding
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
    paddingTop: 8,
    paddingHorizontal: 24,
    backgroundColor: AppStyles.cardColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  }
})
