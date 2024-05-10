import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { ReactNode } from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"

export type SettingsScrollViewProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsScrollView = ({
  children,
  style
}: SettingsScrollViewProps) => (
  <Animated.ScrollView
    style={[style, styles.scroll]}
    contentContainerStyle={styles.contentContainer}
  >
    {children}
  </Animated.ScrollView>
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
