import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, Switch, ViewStyle } from "react-native"
import { useTiFFormSectionContext } from "./Section"

export type TiFFormSwitchProps = {
  isOn: boolean
  onIsOnChange?: (isOn: boolean) => void
  isDisabled?: boolean
  style?: StyleProp<ViewStyle>
}

export const TiFFormSwitchView = ({
  isOn,
  onIsOnChange,
  isDisabled,
  style
}: TiFFormSwitchProps) => {
  const isSectionDisabled = useTiFFormSectionContext().isDisabled
  return (
    <Switch
      value={isOn}
      onValueChange={onIsOnChange}
      trackColor={{ true: AppStyles.darkColor }}
      thumbColor={isOn ? "#ffffff" : "#f4f3f4"}
      disabled={isDisabled ?? isSectionDisabled}
      style={style}
    />
  )
}
