import { ReactNode } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { TiFFormLabelView } from "./Label"

export type TiFFormRowItemProps = {
  title: string
  description?: string
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const TiFFormRowItemView = ({
  title,
  description,
  children,
  style
}: TiFFormRowItemProps) => (
  <View style={style}>
    <View style={styles.row}>
      <TiFFormLabelView
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
