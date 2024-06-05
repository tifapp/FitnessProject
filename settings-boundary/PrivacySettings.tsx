import { useUserSettings } from "@settings-storage/Hooks"
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
import { settingsSelector } from "@settings-storage/Settings"

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
      We are committed to protecting your data and prioritize your privacy at
      all times. Your data is only used to enhance the app with you remaining in
      control of it.
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
  const { settings, update } = useUserSettings(
    settingsSelector(
      "isAnalyticsEnabled",
      "isCrashReportingEnabled",
      "canShareArrivalStatus"
    )
  )
  return (
    <SettingsSectionView title="Control What You Share">
      <SettingsToggleCardView
        title="Anonymous Analytics"
        description="To improve your app experience, we collect anonymous usage data to enhance the quality of the app. This data is not linked to you."
        iconName="bar-chart"
        iconBackgroundColor={AppStyles.red}
        isOn={settings.isAnalyticsEnabled}
        onIsOnChange={(isAnalyticsEnabled) => update({ isAnalyticsEnabled })}
      />
      <SettingsToggleCardView
        title="Crash Reports"
        description="To reduce bugs, crashes, and errors, we collect anonymous usage data regarding app issues. This data is not linked to you."
        iconName="warning"
        iconBackgroundColor={AppStyles.yellow}
        isOn={settings.isCrashReportingEnabled}
        onIsOnChange={(isCrashReportingEnabled) => {
          update({ isCrashReportingEnabled })
        }}
      />
      <SettingsToggleCardView
        title="Event Arrivals"
        description="You can stay connected with participants by notifying them of your arrival at an event’s designated location."
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
      description="Your location is used to discover events, select current location, and precisely detect your arrival at an event’s designated location."
      iconName="location"
      iconBackgroundColor={AppStyles.blue}
      isOn={permissions.foregroundLocation.isGranted}
      onToggleTappedWithoutIsOnChange={permissions.foregroundLocation.onToggled}
    />
    <SettingsToggleCardView
      title="Location While Not Using the App"
      description="Your location is used to precisely detect your arrival at an event’s designated location. You can share your arrival status without having the app open."
      iconName="golf"
      iconBackgroundColor={AppStyles.purple}
      isOn={permissions.backgroundLocation.isGranted}
      onToggleTappedWithoutIsOnChange={permissions.backgroundLocation.onToggled}
    />
    <SettingsToggleCardView
      title="Notifications"
      description="Enable app notifications to receive important event updates, arrivals notifications, and profile notifications."
      iconName="notifications"
      iconBackgroundColor={AppStyles.orange}
      isOn={permissions.notifications.isGranted}
      onToggleTappedWithoutIsOnChange={permissions.notifications.onToggled}
    />
  </SettingsSectionView>
)

const styles = StyleSheet.create({
  privacyIllustration: {
    width: "100%",
    height: 250,
    backgroundColor: "red"
  }
})
