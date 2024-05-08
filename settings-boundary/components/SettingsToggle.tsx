import { Caption, Headline } from "@components/Text"
import { CircularIonicon, IoniconName } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { StyleProp, ViewStyle, View, StyleSheet, Pressable } from "react-native"
import { SettingsSwitchView } from "./SettingsSwitch"

export type SettingsToggleProps = {
  isOn: boolean
  onChange?: (isOn: boolean) => void
  onTogglePress?: () => void
  isDisabled?: boolean
  iconName: IoniconName
  iconBackgroundColor: string | ColorString
  title: string
  description: string
  style?: StyleProp<ViewStyle>
}

export const SettingsToggleView = ({
  iconName,
  iconBackgroundColor,
  title,
  description,
  isOn,
  isDisabled,
  onChange,
  onTogglePress,
  style
}: SettingsToggleProps) => (
  <View style={[style, styles.container]}>
    <View style={styles.innerContainer}>
      <View style={styles.switchRow}>
        <CircularIonicon
          name={iconName}
          backgroundColor={iconBackgroundColor.toString()}
        />
        <Headline style={styles.switchTitle}>{title}</Headline>
        <Pressable onPress={onTogglePress}>
          <View pointerEvents={onTogglePress ? "none" : "auto"}>
            <SettingsSwitchView
              isOn={isOn}
              onChange={onChange}
              isDisabled={isDisabled}
            />
          </View>
        </Pressable>
      </View>
      <Caption>{description}</Caption>
    </View>
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
  switchTitle: {
    flex: 1
  },
  switchRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  }
})
