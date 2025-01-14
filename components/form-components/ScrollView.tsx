import { StyleSheet } from "react-native"
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps
} from "react-native-keyboard-aware-scroll-view"

export type TiFFormScrollViewProps = Omit<
  KeyboardAwareScrollViewProps,
  "contentContainerStyle"
>

export const TiFFormScrollView = ({
  children,
  style,
  ...props
}: TiFFormScrollViewProps) => (
  <KeyboardAwareScrollView
    style={[style, styles.scroll]}
    contentContainerStyle={styles.contentContainer}
    enableResetScrollToCoords={false}
    {...props}
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
