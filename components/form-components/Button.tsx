import { AppStyles } from "@lib/AppColorStyle"
import {
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewStyle
} from "react-native"
import { useTiFFormSectionContext } from "./Section"

export type TiFFormRowButtonProps = {
  onTapped?: () => void
  isDisabled?: boolean
  children: JSX.Element
  style?: StyleProp<ViewStyle>
}

export const TiFFormRowButton = ({
  onTapped,
  isDisabled,
  children,
  style
}: TiFFormRowButtonProps) => {
  const isSectionDisabled = useTiFFormSectionContext().isDisabled
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
