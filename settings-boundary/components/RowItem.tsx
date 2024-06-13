import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
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
    columnGap: 8,
    alignItems: "center",
    padding: 16,
    flex: 1
  },
  label: {
    flex: 1
  }
})
