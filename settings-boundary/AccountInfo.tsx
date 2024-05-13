import { StyleProp, View, ViewStyle } from "react-native"

export const useAccountInfoSettings = () => {
  return {}
}

export type AccountInfoSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const AccountInfoSettingsView = ({
  style
}: AccountInfoSettingsProps) => <View style={style} />
