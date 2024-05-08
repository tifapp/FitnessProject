import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, Switch, ViewStyle } from "react-native"

export type SettingsSwitchProps = {
  isOn: boolean
  onChange?: (isOn: boolean) => void
  isDisabled?: boolean
  style?: StyleProp<ViewStyle>
}

export const SettingsSwitchView = ({
  isOn,
  onChange,
  isDisabled,
  style
}: SettingsSwitchProps) => (
  <Switch
    value={isOn}
    onValueChange={onChange}
    trackColor={{ true: AppStyles.darkColor }}
    thumbColor={isOn ? "#ffffff" : "#f4f3f4"}
    disabled={isDisabled}
    style={style}
  />
)
