import { Footnote } from "@components/Text"
import { IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SettingsCardView } from "./Card"
import { SettingsNamedIconRowView } from "./NamedIconRow"
import { useCurrentSettingsSection } from "./Section"
import { SettingsSwitchView } from "./Switch"

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
          <Pressable
            onPress={
              !useCurrentSettingsSection().isDisabled
                ? onToggleTappedWithoutIsOnChange
                : undefined
            }
          >
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
        <Footnote style={styles.bottomText}>{description}</Footnote>
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
    display: "flex",
    flexDirection: "column"
  },
  bottomText: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    opacity: 0.5
  }
})
