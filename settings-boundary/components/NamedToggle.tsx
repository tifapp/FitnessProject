import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsSwitchView } from "./Switch"
import { SettingsLabelView } from "./Label"

export type SettingsNamedToggleProps = {
  name: string
  description?: string
  isOn: boolean
  onIsOnChange: (isOn: boolean) => void
  style?: StyleProp<ViewStyle>
}

export const SettingsNamedToggleView = ({
  name,
  description,
  isOn,
  onIsOnChange,
  style
}: SettingsNamedToggleProps) => (
  <View style={style}>
    <View style={styles.container}>
      <SettingsLabelView
        title={name}
        description={description}
        style={styles.label}
      />
      <SettingsSwitchView isOn={isOn} onIsOnChange={onIsOnChange} />
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
    rowGap: 4
  }
})
