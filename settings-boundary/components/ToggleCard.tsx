import { Footnote } from "@components/Text"
import { IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, ViewStyle, View, StyleSheet, Pressable } from "react-native"
import { SettingsSwitchView } from "./Switch"
import { SettingsCardView } from "./Card"
import { SettingsNamedIconRowView } from "./NamedIconRow"

export type SettingsToggleCardProps = {
  isOn: boolean
  onIsOnChange?: (isOn: boolean) => void
  onToggleTappedWithoutIsOnChange?: () => void
  isDisabled?: boolean
  iconName: IoniconName
  iconBackgroundColor: ColorString
  title: string
  description: string
  style?: StyleProp<ViewStyle>
}

export const SettingsToggleCardView = ({
  iconName,
  iconBackgroundColor,
  title,
  description,
  isOn,
  isDisabled,
  onIsOnChange,
  onToggleTappedWithoutIsOnChange,
  style
}: SettingsToggleCardProps) => (
  <View style={style}>
    <SettingsCardView>
      <View style={styles.innerContainer}>
        <SettingsNamedIconRowView
          iconName={iconName}
          iconBackgroundColor={iconBackgroundColor}
          name={title}
        >
          <Pressable onPress={onToggleTappedWithoutIsOnChange}>
            <View
              pointerEvents={onToggleTappedWithoutIsOnChange ? "none" : "auto"}
            >
              <SettingsSwitchView
                isOn={isOn}
                onIsOnChange={onIsOnChange}
                isDisabled={isDisabled}
              />
            </View>
          </Pressable>
        </SettingsNamedIconRowView>
        <Footnote style={styles.descriptionText}>{description}</Footnote>
      </View>
    </SettingsCardView>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.eventCardColor,
    borderRadius: 12
  },
  innerContainer: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    rowGap: 8
  },
  descriptionText: {
    opacity: 0.5
  }
})
