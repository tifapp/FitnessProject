import { ReactNode } from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export type TiFFormScrollViewProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const TiFFormScrollView = ({
  children,
  style
}: TiFFormScrollViewProps) => (
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
