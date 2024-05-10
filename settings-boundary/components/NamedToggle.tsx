import { Footnote, Headline } from "@components/Text"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsSwitchView } from "./Switch"

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
      <View style={styles.label}>
        <Headline>{name}</Headline>
        {description && (
          <Footnote style={styles.description}>{description}</Footnote>
        )}
      </View>
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
    flex: 1,
    rowGap: 4
  },
  description: {
    opacity: 0.5
  }
})
