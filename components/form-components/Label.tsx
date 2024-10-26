import { Footnote, Headline } from "@components/Text"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"

export type TiFFormLabelProps = {
  title: string
  description?: string
  maximumFontScaleFactor?: number
  style?: StyleProp<ViewStyle>
}

export const TiFFormLabelView = ({
  title,
  description,
  maximumFontScaleFactor: maximumFontSizeMultiplier,
  style
}: TiFFormLabelProps) => (
  <View style={style}>
    <View style={styles.label}>
      <Headline maxFontSizeMultiplier={maximumFontSizeMultiplier}>
        {title}
      </Headline>
      {description && (
        <Footnote
          maxFontSizeMultiplier={maximumFontSizeMultiplier}
          style={styles.description}
        >
          {description}
        </Footnote>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  label: {
    rowGap: 4
  },
  description: {
    opacity: 0.5
  }
})
