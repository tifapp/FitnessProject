import { Ionicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsButton } from "./Button"
import { SettingsNamedIconRowView } from "./NamedIconRow"
import { ReactNode } from "react"

export type SettingsNavigationLinkProps = {
  title: string
  iconName: IoniconName
  iconBackgroundColor: ColorString
  onTapped: () => void
  isDisabled?: boolean
  rightAccessory?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const SettingsNavigationLinkView = ({
  title,
  iconName,
  iconBackgroundColor,
  onTapped,
  isDisabled,
  rightAccessory,
  style
}: SettingsNavigationLinkProps) => (
  <SettingsButton onTapped={onTapped} isDisabled={isDisabled} style={style}>
    <SettingsNamedIconRowView
      iconName={iconName}
      iconBackgroundColor={iconBackgroundColor}
      name={title}
    >
      <View style={styles.accessoryRow}>
        {rightAccessory}
        <Ionicon name="chevron-forward" style={styles.chevron} />
      </View>
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
  },
  accessoryRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
})
