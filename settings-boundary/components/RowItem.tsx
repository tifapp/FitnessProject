import { ReactNode } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { SettingsLabelView } from "./Label"

export type SettingsRowItemProps = {
  title: string
  description?: string
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsRowItemView = ({
  title,
  description,
  children,
  style
}: SettingsRowItemProps) => (
  <View style={style}>
    <View style={styles.row}>
      <SettingsLabelView
        title={title}
        description={description}
        style={styles.label}
      />
      {children}
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    padding: 16
  },
  label: {
    flex: 1
  }
})
