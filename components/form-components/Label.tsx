import { Footnote, Headline } from "@components/Text"
import { ReactNode } from "react"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"

export type TiFFormLabelProps = {
  title: ReactNode
  description?: ReactNode
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
      {typeof title === "string" ? (
        <Headline maxFontSizeMultiplier={maximumFontSizeMultiplier}>
          {title}
        </Headline>
      ) : (
        title
      )}
      {typeof description === "string" ? (
        <Footnote
          maxFontSizeMultiplier={maximumFontSizeMultiplier}
          style={styles.description}
        >
          {description}
        </Footnote>
      ) : (
        description
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
