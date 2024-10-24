import { PermissionResponse } from "expo-location"
import { openSettings as expoOpenSettings } from "expo-linking"

/**
 * An object for interacting with permissions requests in settings screens.
 *
 * Various setting screens have mechanisms that allow the user to manually
 * request for certain device permissions. However, the device may not always
 * be able to ask for those permissions. Instead the system Settings app
 * should be opened which allows the user to enable/disable permissions
 * for the app manually.
 */
export type SettingsPermission<
  Permission extends PermissionResponse = PermissionResponse
> = ReturnType<typeof settingsPermission<Permission>>

/**
 * Returns an {@link SettingsPermission}.
 */
export const settingsPermission = <
  Permission extends PermissionResponse = PermissionResponse
>(
  permissions: Permission | null,
  request: () => Promise<Permission>,
  openSettings: () => Promise<void> = expoOpenSettings
) => {
  const shouldOpenSettings =
    permissions && (permissions.granted || !permissions.canAskAgain)
  return {
    isGranted: permissions?.granted ?? false,
    onToggled: shouldOpenSettings ? openSettings : request
  }
}
