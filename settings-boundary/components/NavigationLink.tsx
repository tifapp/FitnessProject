import { Ionicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsButton } from "./Button"
import { SettingsLabelView } from "./Label"
import { SettingsNamedIconRowView } from "./NamedIconRow"

type BaseSettingsNavigationLinkProps = {
  title: string
  description?: string
  onTapped: () => void
  isDisabled?: boolean
  style?: StyleProp<ViewStyle>
}

export type SettingsNavigationLinkProps = BaseSettingsNavigationLinkProps &
  (
    | {
        iconName: IoniconName
        iconBackgroundColor: ColorString
      }
    | { iconName?: undefined; iconBackgroundColor?: undefined }
  )

export const SettingsNavigationLinkView = ({
  title,
  description,
  iconName,
  iconBackgroundColor,
  onTapped,
  isDisabled,
  style
}: SettingsNavigationLinkProps) => (
  <SettingsButton onTapped={onTapped} isDisabled={isDisabled} style={style}>
    {iconName ? (
      <SettingsNamedIconRowView
        iconName={iconName}
        iconBackgroundColor={iconBackgroundColor}
        name={title}
      >
        <Ionicon name="chevron-forward" style={styles.chevron} />
      </SettingsNamedIconRowView>
    ) : (
      <View style={styles.row}>
        <SettingsLabelView title={title} description={description} />
        <Ionicon name="chevron-forward" style={styles.chevron} />
      </View>
    )}
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
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
})
