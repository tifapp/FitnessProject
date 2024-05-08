import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, Switch, ViewStyle } from "react-native"

export type SettingsSwitchProps = {
  isOn: boolean
  onIsOnChange?: (isOn: boolean) => void
  isDisabled?: boolean
  style?: StyleProp<ViewStyle>
}

export const SettingsSwitchView = ({
  isOn,
  onIsOnChange,
  isDisabled,
  style
}: SettingsSwitchProps) => (
  <Switch
    value={isOn}
    onValueChange={onIsOnChange}
    trackColor={{ true: AppStyles.darkColor }}
    thumbColor={isOn ? "#ffffff" : "#f4f3f4"}
    disabled={isDisabled}
    style={style}
  />
)
