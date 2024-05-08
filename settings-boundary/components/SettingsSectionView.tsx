import { Headline } from "@components/Text"
import { ViewStyle, View, StyleProp, StyleSheet } from "react-native"

export type SettingsSectionProps = {
  title?: string
  children: JSX.Element | JSX.Element[]
  style?: StyleProp<ViewStyle>
}

export const SettingsSectionView = ({
  title,
  children,
  style
}: SettingsSectionProps) => (
  <View style={style}>
    <View style={styles.container}>
      {title && <Headline>{title}</Headline>}
      {children}
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    rowGap: 16
  }
})
