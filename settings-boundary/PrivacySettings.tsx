import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/Settings"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { SettingsSectionView } from "./components/Section"
import { BodyText } from "@components/Text"
import {
  useBackgroundPermissions as useBackgroundLocationPermissions,
  useForegroundPermissions as useForegroundLocationPermissions
} from "expo-location"
import { usePermissions as useNotificationPermissions } from "expo-notifications"
import { SettingsToggleCardView } from "./components/ToggleCard"
import { AppStyles } from "@lib/AppColorStyle"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsCardView } from "./components/Card"
import { SettingsScrollView } from "./components/ScrollView"
import { settingsPermission } from "./Permissions"

export const usePrivacySettingsPermissions = () => {
  const [foregroundStatus, requestForeground] =
    useForegroundLocationPermissions()
  const [backgroundStatus, requestBackground] =
    useBackgroundLocationPermissions()
  const [notificationsStatus, requestNotifications] =
    useNotificationPermissions()
  return {
    foregroundLocation: settingsPermission(foregroundStatus, requestForeground),
    backgroundLocation: settingsPermission(backgroundStatus, requestBackground),
    notifications: settingsPermission(notificationsStatus, requestNotifications)
  }
}

export type PrivacySettingsProps = {
  permissions: ReturnType<typeof usePrivacySettingsPermissions>
  onPrivacyPolicyTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const PrivacySettingsView = ({
  permissions,
  onPrivacyPolicyTapped,
  style
}: PrivacySettingsProps) => {
  return (
    <SettingsScrollView style={style}>
      <PreabmleSectionView />
      <LearnMoreSectionView onPrivacyPolicyTapped={onPrivacyPolicyTapped} />
      <ShareSectionView />
      <PermissionsSectionView permissions={permissions} />
    </SettingsScrollView>
  )
}

const PreabmleSectionView = () => (
  <SettingsSectionView>
    <View style={styles.privacyIllustration} />
    <BodyText>
      We are commited to your privacy and will protect your data at all times.
      Your data belongs to you, and is only shared with those whom you wish to
      share it with.
    </BodyText>
  </SettingsSectionView>
)

type LearnMoreSectionProps = {
  onPrivacyPolicyTapped: () => void
}

const LearnMoreSectionView = ({
  onPrivacyPolicyTapped
}: LearnMoreSectionProps) => (
  <SettingsSectionView title="Learn More">
    <SettingsCardView>
      <SettingsNavigationLinkView
        title="Privacy Policy"
        onTapped={onPrivacyPolicyTapped}
        iconName="lock-closed"
        iconBackgroundColor={AppStyles.black}
      />
    </SettingsCardView>
  </SettingsSectionView>
)

const ShareSectionView = () => {
  const { settings, update } = useUserSettings(shareSectionSelector)
  return (
    <SettingsSectionView title="Control What You Share">
      <SettingsToggleCardView
        title="Anonymous Analytics"
        description="We improve the app by having a better understanding of how you and others use the app. To do this we collect anonymous usage data that's not linked to you in any way."
        iconName="bar-chart"
        iconBackgroundColor={AppStyles.red}
        isOn={settings.isAnalyticsEnabled}
        onIsOnChange={(isAnalyticsEnabled) => update({ isAnalyticsEnabled })}
      />
      <SettingsToggleCardView
        title="Crash Reports"
        description="We reduce bugs and crashes by collecting anonymous usage data around app issues. This data is not linked to you in any way."
        iconName="warning"
        iconBackgroundColor={AppStyles.yellow}
        isOn={settings.isCrashReportingEnabled}
        onIsOnChange={(isCrashReportingEnabled) => {
          update({ isCrashReportingEnabled })
        }}
      />
      <SettingsToggleCardView
        title="Event Arrivals"
        description="We detect when you arrive at events so that we can let other participants know that you've arrived. You can choose to disable sharing this to others."
        iconName="footsteps"
        iconBackgroundColor={AppStyles.green}
        isOn={settings.canShareArrivalStatus}
        onIsOnChange={(canShareArrivalStatus) => {
          update({ canShareArrivalStatus })
        }}
      />
    </SettingsSectionView>
  )
}

type PermissionsSectionProps = {
  permissions: ReturnType<typeof usePrivacySettingsPermissions>
}

const PermissionsSectionView = ({ permissions }: PermissionsSectionProps) => (
  <SettingsSectionView title="Device Permissions">
    <SettingsToggleCardView
      title="Location While Using the App"
      description="Your location is used to search for local events in your area, and to detect whether or not you arrive at an event when the app is open."
      iconName="location"
      iconBackgroundColor={AppStyles.blue}
      isOn={permissions.foregroundLocation.isGranted}
      onToggleTappedWithoutIsOnChange={permissions.foregroundLocation.onToggled}
    />
    <SettingsToggleCardView
      title="Location While Not Using the App"
      description="Your location is used to detect when you arrive at events when the app is not open."
      iconName="golf"
      iconBackgroundColor={AppStyles.purple}
      isOn={permissions.backgroundLocation.isGranted}
      onToggleTappedWithoutIsOnChange={permissions.backgroundLocation.onToggled}
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

const shareSectionSelector = (settings: UserSettings) => ({
  isAnalyticsEnabled: settings.isAnalyticsEnabled,
  isCrashReportingEnabled: settings.isCrashReportingEnabled,
  canShareArrivalStatus: settings.canShareArrivalStatus
})

const styles = StyleSheet.create({
  privacyIllustration: {
    width: "100%",
    height: 250,
    backgroundColor: "red"
  }
})
