import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/User"
import {
  ScrollView,
  StyleProp,
  ViewStyle,
  StyleSheet,
  View
} from "react-native"
import { SettingsSectionView } from "./components/SettingsSectionView"
import { BodyText } from "@components/Text"
import {
  useBackgroundPermissions as useBackgroundLocationPermissions,
  useForegroundPermissions as useForegroundLocationPermissions,
  PermissionResponse
} from "expo-location"
import { usePermissions as useNotificationPermissions } from "expo-notifications"
import { openSettings as expoOpenSettings } from "expo-linking"
import { SettingsToggleView } from "./components/SettingsToggle"
import { AppStyles } from "@lib/AppColorStyle"

export const privacySettingsPermissionsStatus = <
  Permission extends PermissionResponse
>(
  permissions: Permission | null,
  request: () => Promise<Permission>,
  openSettings: () => Promise<void> = expoOpenSettings
) => {
  const shouldOpenSettings =
    permissions && (permissions.granted || !permissions.canAskAgain)
  return {
    isGranted: permissions?.granted ?? false,
    action: shouldOpenSettings ? openSettings : request
  }
}

export const usePrivacySettingsPermissions = () => {
  const [foregroundStatus, requestForeground] =
    useForegroundLocationPermissions()
  const [backgroundStatus, requestBackground] =
    useBackgroundLocationPermissions()
  const [notificationsStatus, requestNotifications] =
    useNotificationPermissions()
  return {
    foregroundLocation: privacySettingsPermissionsStatus(
      foregroundStatus,
      requestForeground
    ),
    backgroundLocation: privacySettingsPermissionsStatus(
      backgroundStatus,
      requestBackground
    ),
    notifications: privacySettingsPermissionsStatus(
      notificationsStatus,
      requestNotifications
    )
  }
}

export type PrivacySettingsProps = {
  permissions: ReturnType<typeof usePrivacySettingsPermissions>
  style?: StyleProp<ViewStyle>
}

const privacySettingsSelector = (settings: UserSettings) => ({
  isAnalyticsEnabled: settings.isAnalyticsEnabled,
  isCrashReportingEnabled: settings.isCrashReportingEnabled,
  canShareArrivalStatus: settings.canShareArrivalStatus
})

export const PrivacySettingsView = ({
  permissions,
  style
}: PrivacySettingsProps) => {
  const { settings, update } = useUserSettings(privacySettingsSelector)
  return (
    <ScrollView style={style} contentContainerStyle={styles.contentContainer}>
      <SettingsSectionView>
        <View style={styles.privacyIllustration} />
        <BodyText>
          We are commited to your privacy and will protect your data at all
          times. Your data belongs to you, and is only shared with those whom
          you wish to share it with.
        </BodyText>
      </SettingsSectionView>
      <SettingsSectionView title="Control What You Share">
        <SettingsToggleView
          title="Anonymous Analytics"
          description="We improve the app by having a better understanding of how you and others use the app. To do this we collect anonymous usage data that's not linked to you in any way."
          iconName="bar-chart"
          iconBackgroundColor={AppStyles.red}
          isOn={settings.isAnalyticsEnabled}
          onChange={(isAnalyticsEnabled) => update({ isAnalyticsEnabled })}
        />
        <SettingsToggleView
          title="Crash Reports"
          description="We reduce bugs and crashes by collecting anonymous usage data around app issues. This data is not linked to you in any way."
          iconName="warning"
          iconBackgroundColor={AppStyles.yellow}
          isOn={settings.isCrashReportingEnabled}
          onChange={(isCrashReportingEnabled) => {
            update({ isCrashReportingEnabled })
          }}
        />
        <SettingsToggleView
          title="Event Arrivals"
          description="We detect when you arrive at events so that we can let other participants know that you've arrived. You can choose to disable sharing this to others."
          iconName="footsteps"
          iconBackgroundColor={AppStyles.green}
          isOn={settings.canShareArrivalStatus}
          onChange={(canShareArrivalStatus) => {
            update({ canShareArrivalStatus })
          }}
        />
      </SettingsSectionView>
      <SettingsSectionView title="Device Permissions">
        <SettingsToggleView
          title="Location While Using the App"
          description="Your location is used to search for local events in your area, and to detect whether or not you arrive at an event when the app is open."
          iconName="location"
          iconBackgroundColor={AppStyles.blue}
          isOn={permissions.foregroundLocation.isGranted}
          onTogglePress={permissions.foregroundLocation.action}
        />
        <SettingsToggleView
          title="Location While Not Using the App"
          description="Your location is used to detect when you arrive at events when the app is not open."
          iconName="golf"
          iconBackgroundColor={AppStyles.purple}
          isOn={permissions.backgroundLocation.isGranted}
          onTogglePress={permissions.backgroundLocation.action}
        />
        <SettingsToggleView
          title="Notifications"
          description="Your location is used to detect when you arrive at events when the app is not open."
          iconName="notifications"
          iconBackgroundColor={AppStyles.orange}
          isOn={permissions.notifications.isGranted}
          onTogglePress={permissions.notifications.action}
        />
      </SettingsSectionView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  privacyIllustration: {
    width: "100%",
    height: 250,
    backgroundColor: "red"
  },
  contentContainer: {
    paddingHorizontal: 24,
    rowGap: 32
  }
})
