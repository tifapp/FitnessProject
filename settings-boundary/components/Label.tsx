import { Footnote, Headline } from "@components/Text"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type SettingsLabelProps = {
  style?: StyleProp<ViewStyle>
  title: string
  description?: string
}

export const SettingsLabelView = ({
  style,
  title,
  description
}: SettingsLabelProps) => (
  <View style={style}>
    <View style={styles.label}>
      <Headline>{title}</Headline>
      {description && (
        <Footnote style={styles.description}>{description}</Footnote>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  label: {
    flex: 1,
    rowGap: 4
  },
  description: {
    opacity: 0.5
  }
})
