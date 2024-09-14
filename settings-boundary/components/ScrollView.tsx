import { ReactNode } from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export type SettingsScrollViewProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsScrollView = ({
  children,
  style
}: SettingsScrollViewProps) => (
  <KeyboardAwareScrollView
    style={[style, styles.scroll]}
    contentContainerStyle={styles.contentContainer}
  >
    {children}
  </KeyboardAwareScrollView>
)

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    rowGap: 32
  },
  scroll: {
    height: "100%"
  }
})
