import { Ionicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"
import { SettingsNamedIconRowView } from "./NamedIconRow"
import { SettingsButton } from "./Button"

export type SettingsNavigationLinkProps = {
  title: string
  iconName: IoniconName
  iconBackgroundColor: ColorString
  onTapped: () => void
  isDisabled?: boolean
  style?: StyleProp<ViewStyle>
}

export const SettingsNavigationLinkView = ({
  title,
  iconName,
  iconBackgroundColor,
  onTapped,
  isDisabled,
  style
}: SettingsNavigationLinkProps) => (
  <SettingsButton onTapped={onTapped} isDisabled={isDisabled} style={style}>
    <SettingsNamedIconRowView
      iconName={iconName}
      iconBackgroundColor={iconBackgroundColor}
      name={title}
    >
      <Ionicon name="chevron-forward" style={styles.chevron} />
    </SettingsNamedIconRowView>
  </SettingsButton>
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
