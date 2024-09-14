import { Ionicon, IoniconName } from "@components/common/Icons"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { ReactNode } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsButton } from "./Button"
import { SettingsNamedIconRowView } from "./NamedIconRow"
import { SettingsRowItemView } from "./RowItem"

type BaseSettingsNavigationLinkProps = {
  title: string
  description?: string
  onTapped: () => void
  isDisabled?: boolean
  rightAccessory?: ReactNode
  chevronStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

export type SettingsNavigationLinkProps = BaseSettingsNavigationLinkProps &
  (
    | {
        iconName: IoniconName
        iconBackgroundColor: ColorString
      }
    | {
        iconName?: undefined
        iconBackgroundColor?: undefined
      }
  )

export const SettingsNavigationLinkView = ({
  title,
  description,
  iconName,
  iconBackgroundColor,
  onTapped,
  isDisabled,
  rightAccessory,
  chevronStyle = styles.chevron,
  style
}: SettingsNavigationLinkProps) => (
  <SettingsButton onTapped={onTapped} isDisabled={isDisabled} style={style}>
    {iconName ? (
      <SettingsNamedIconRowView
        iconName={iconName}
        iconBackgroundColor={iconBackgroundColor}
        name={title}
        description={description}
      >
        <View style={styles.accessoryRow}>
          {rightAccessory}
          <Ionicon name="chevron-forward" style={chevronStyle} />
        </View>
      </SettingsNamedIconRowView>
    ) : (
      <SettingsRowItemView title={title} description={description}>
        <View style={styles.accessoryRow}>
          {rightAccessory}
          <Ionicon name="chevron-forward" style={chevronStyle} />
        </View>
      </SettingsRowItemView>
    )}
  </SettingsButton>
)

const styles = StyleSheet.create({
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
