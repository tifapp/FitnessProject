import { UserSettings } from "TiFShared/domain-models/Settings"
import { createContext, useCallback, useContext } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"
import { LocalSettings } from "./LocalSettings"
import { AnySettings, SettingsStore, areSettingsEqual } from "./Settings"

const SettingsContext = createContext<
  | {
      localSettingsStore: SettingsStore<LocalSettings>
      userSettingsStore: SettingsStore<UserSettings>
    }
  | undefined
>(undefined)

export type SettingsProviderProps = {
  localSettingsStore: SettingsStore<LocalSettings>
  userSettingsStore: SettingsStore<UserSettings>
  children: JSX.Element
}

export const SettingsProvider = ({
  localSettingsStore,
  userSettingsStore,
  children
}: SettingsProviderProps) => (
  <SettingsContext.Provider value={{ localSettingsStore, userSettingsStore }}>
    {children}
  </SettingsContext.Provider>
)

/**
 * Returns the current device settings, along with the store that stores the
 * settings.
 */
export const useLocalSettings = <ScopedSettings extends AnySettings>(
  selector: (userSettings: LocalSettings) => ScopedSettings
) => useSettingsStore(useSettings().localSettingsStore, selector)

/**
 * Returns the current user settings, along with the store that stores the
 * settings.
 */
export const useUserSettings = <ScopedSettings extends AnySettings>(
  selector: (userSettings: UserSettings) => ScopedSettings
) => useSettingsStore(useSettings().userSettingsStore, selector)

/**
 * Returns a function to update the current local settings.
 */
export const useUpdateLocalSettings = () => {
  const localStore = useSettings().localSettingsStore
  return (localSettings: Partial<LocalSettings>) =>
    localStore.update(localSettings)
}

/**
 * Returns a function to update the current user settings.
 */
export const useUpdateUserSettings = () => {
  const userStore = useSettings().userSettingsStore
  return (userSettings: Partial<UserSettings>) => userStore.update(userSettings)
}

const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("No SettingsProvider provided.")
  return context
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
