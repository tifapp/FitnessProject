import { UserSettings } from "TiFShared/domain-models/Settings"
import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"
import { LocalSettings, SQLiteLocalSettingsStorage } from "./LocalSettings"
import { AnySettings, SettingsStore, areSettingsEqual } from "./Settings"
import { featureContext } from "@lib/FeatureContext"
import { PersistentSettingsStores } from "./PersistentStores"
import { tiFSQLite } from "@lib/SQLite"
import { SQLiteUserSettingsStorage } from "./UserSettings"

const SettingsStorageFeature = featureContext({
  localSettingsStore: PersistentSettingsStores.local(
    new SQLiteLocalSettingsStorage(tiFSQLite)
  ) as SettingsStore<LocalSettings>,
  // TODO: - Use UserSettingsSynchronizingStore in beta.
  userSettingsStore: PersistentSettingsStores.user(
    new SQLiteUserSettingsStorage(tiFSQLite)
  ) as SettingsStore<UserSettings>
})

export const SettingsProvider = SettingsStorageFeature.Provider

/**
 * Returns the current device settings, along with the store that stores the
 * settings.
 */
export const useLocalSettings = <ScopedSettings extends AnySettings>(
  selector: (userSettings: LocalSettings) => ScopedSettings
) => {
  return useSettingsStore(
    SettingsStorageFeature.useContext().localSettingsStore,
    selector
  )
}

/**
 * Returns the current user settings, along with the store that stores the
 * settings.
 */
export const useUserSettings = <ScopedSettings extends AnySettings>(
  selector: (userSettings: UserSettings) => ScopedSettings
) => {
  return useSettingsStore(
    SettingsStorageFeature.useContext().userSettingsStore,
    selector
  )
}

/**
 * Returns a function to update the current local settings.
 */
export const useUpdateLocalSettings = () => {
  const localStore = SettingsStorageFeature.useContext().localSettingsStore
  return (localSettings: Partial<LocalSettings>) =>
    localStore.update(localSettings)
}

/**
 * Returns a function to update the current user settings.
 */
export const useUpdateUserSettings = () => {
  const userStore = SettingsStorageFeature.useContext().userSettingsStore
  return (userSettings: Partial<UserSettings>) => userStore.update(userSettings)
}

const useSettingsStore = <
  Settings extends AnySettings,
  ScopedSettings extends AnySettings
>(
  store: SettingsStore<Settings>,
  selector: (userSettings: Settings) => ScopedSettings
) => ({
  settings: useSyncExternalStoreWithSelector(
    useCallback((callback) => store.subscribe(callback), [store]),
    () => store.mostRecentlyPublished,
    undefined,
    selector,
    areSettingsEqual
  ),
  update: (settings: Partial<Settings>) => store.update(settings)
})
