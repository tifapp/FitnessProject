import { useKeyboardState } from "@lib/Keyboard"
import { ReactNode, useState } from "react"
import {
  LayoutRectangle,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TiFScrollView, TiFScrollViewProps } from "../common/ScrollView"

export type TiFFormScrollableLayoutProps = {
  children: ReactNode
  footer: JSX.Element
  style?: StyleProp<ViewStyle>
} & Omit<TiFScrollViewProps, "contentInset">

export const TiFFormScrollableLayoutView = ({
  children,
  footer,
  style,
  ...props
}: TiFFormScrollableLayoutProps) => {
  const [footerLayout, setFooterLayout] = useState<
    LayoutRectangle | undefined
  >()
  const { isPresented: isKeyboardPresented } = useKeyboardState()
  const safeArea = useSafeAreaInsets().bottom

  // NB: We have to omit the contentInset key entirely on iOS to ensure that the entire view is
  // scrollable when the keyboard is presented. For some reason, even setting contentInset to
  // undefined will mess things up on iOS.
  const scrollProps =
    Platform.OS === "ios" && !isKeyboardPresented
      ? {
          contentInset: {
            top: 0,
            left: 0,
            right: 0,
            bottom: (footerLayout?.height ?? 0) - safeArea
          },
          ...props
        }
      : props

  return (
    <View style={style}>
      <View style={styles.container}>
        <TiFScrollView
          {...scrollProps}
        >
          {children}
          {footerLayout && (
            <View
              style={{
                marginBottom:
                  Platform.OS === "android"
                    ? footerLayout.height + safeArea
                    : isKeyboardPresented
                      ? 0
                      : safeArea
              }}
            />
          )}
        </TiFScrollView>
        <View
          style={styles.footer}
          onLayout={(e) => setFooterLayout(e.nativeEvent.layout)}
        >
          {footer}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: "100%",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "transparent",
    bottom: 0
  }
})
