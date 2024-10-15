import { AppStyles } from "@lib/AppColorStyle"
import {
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewStyle
} from "react-native"
import { useCurrentSettingsSection } from "./Section"

export type SettingsButtonProps = {
  onTapped?: () => void
  isDisabled?: boolean
  children: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const SettingsButton = ({
  onTapped,
  isDisabled,
  children,
  style
}: SettingsButtonProps) => {
  const isSectionDisabled = useCurrentSettingsSection().isDisabled
  const shouldDisable = isDisabled ?? isSectionDisabled
  return (
    <TouchableHighlight
      underlayColor={AppStyles.colorOpacity15}
      onPress={!shouldDisable ? onTapped : undefined}
      style={[style, { opacity: shouldDisable ? 0.5 : 1 }]}
    >
      <View style={styles.container}>{children}</View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0
  }
})