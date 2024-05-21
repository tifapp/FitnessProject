import { AppStyles } from "@lib/AppColorStyle"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { SettingsButton } from "./components/Button"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsSectionView } from "./components/Section"
import { SettingsToggleCardView } from "./components/ToggleCard"

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  onViewHelpTapped: () => void
  onReportBugTapped: () => void
  onRequestFeatureTapped: () => void
}

export const HelpAndSupportView = ({
  style,
  onViewHelpTapped,
  onReportBugTapped,
  onRequestFeatureTapped
}: EventSettingsProps) => (
  <SettingsScrollView style={style}>
    <HelpSectionView
      onViewHelpTapped={onViewHelpTapped}
      onReportBugTapped={onReportBugTapped}
      onRequestFeatureTapped={onRequestFeatureTapped}
    />
  </SettingsScrollView>
)

type PresetSectionProps = {
  onViewHelpTapped: () => void
  onReportBugTapped: () => void
  onRequestFeatureTapped: () => void
}

const HelpSectionView = ({
  onViewHelpTapped,
  onReportBugTapped,
  onRequestFeatureTapped
}: PresetSectionProps) => {
  return (
    <SettingsSectionView>
      <SettingsSectionView
        title="Help Center"
        subtitle="This is the hub for any help you may want, or reports or feedback you might have about the app."
      >
        <SettingsButton>{"View Help Center"}</SettingsButton>
      </SettingsSectionView>
      <SettingsToggleCardView
        title="Location While Not Using the App"
        description="Your location is used to detect when you arrive at events when the app is not open."
        iconName="golf"
        iconBackgroundColor={AppStyles.purple}
        isOn={permissions.backgroundLocation.isGranted}
        onToggleTappedWithoutIsOnChange={
          permissions.backgroundLocation.onToggled
        }
      />
      <SettingsToggleCardView
        title="Notifications"
        description="Receive notifications about the events you attend and much more!"
        iconName="notifications"
        iconBackgroundColor={AppStyles.orange}
        isOn={permissions.notifications.isGranted}
        onToggleTappedWithoutIsOnChange={permissions.notifications.onToggled}
      />
    </SettingsSectionView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderColor: "black"
  },
  cardDuration: {
    color: AppStyles.darkColor
  },
  settingsSection: {
    flexWrap: "wrap"
  }
})
