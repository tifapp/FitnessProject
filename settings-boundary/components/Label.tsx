import { Footnote, Headline } from "@components/Text"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"

export type SettingsLabelProps = {
  title: string
  description?: string
  style?: StyleProp<ViewStyle>
}

export const SettingsLabelView = ({
  title,
  description,
  style
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
