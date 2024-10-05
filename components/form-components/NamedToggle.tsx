import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFFormLabelView } from "./Label"
import { TiFFormSwitchView } from "./Switch"

export type TiFFormNamedToggleProps = {
  name: string
  description?: string
  isOn: boolean
  onIsOnChange: (isOn: boolean) => void
  style?: StyleProp<ViewStyle>
}

export const TiFFormNamedToggleView = ({
  name,
  description,
  isOn,
  onIsOnChange,
  style
}: TiFFormNamedToggleProps) => (
  <View style={style}>
    <View style={styles.container}>
      <TiFFormLabelView
        title={name}
        description={description}
        style={styles.label}
      />
      <TiFFormSwitchView isOn={isOn} onIsOnChange={onIsOnChange} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    padding: 16
  },
  label: {
    flex: 1,
    rowGap: 4
  }
})
