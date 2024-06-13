import { StyleProp, ViewStyle } from "react-native"
import { SettingsRowItemView } from "./RowItem"
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
  <SettingsRowItemView title={name} description={description} style={style}>
    <SettingsSwitchView isOn={isOn} onIsOnChange={onIsOnChange} />
  </SettingsRowItemView>
)
