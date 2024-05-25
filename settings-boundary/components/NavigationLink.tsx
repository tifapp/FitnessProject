import { Ionicon, IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  TouchableHighlight
} from "react-native"
import { SettingsNamedIconRowView } from "./NamedIconRow"

export type SettingsNavigationLinkProps = {
  title: string
  iconName: IoniconName
  iconBackgroundColor: ColorString
  onTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const SettingsNavigationLinkView = ({
  title,
  iconName,
  iconBackgroundColor,
  onTapped,
  style
}: SettingsNavigationLinkProps) => (
  <TouchableHighlight
    underlayColor={AppStyles.colorOpacity15}
    onPress={onTapped}
    style={style}
  >
    <SettingsNamedIconRowView
      iconName={iconName}
      iconBackgroundColor={iconBackgroundColor}
      name={title}
      style={styles.container}
    >
      <Ionicon name="chevron-forward" style={styles.chevron} />
    </SettingsNamedIconRowView>
  </TouchableHighlight>
)

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  titleText: {
    flex: 1
  },
  chevron: {
    opacity: 0.15
  }
})
