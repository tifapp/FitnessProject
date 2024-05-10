import { ReactNode } from "react"
import { StyleProp, ViewStyle, ScrollView, StyleSheet } from "react-native"

export type SettingsScrollViewProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsScrollView = ({
  children,
  style
}: SettingsScrollViewProps) => (
  <ScrollView
    style={[style, styles.scroll]}
    contentContainerStyle={styles.contentContainer}
  >
    {children}
  </ScrollView>
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
