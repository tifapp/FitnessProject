import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore
} from "react"
import { LocalSettings } from "./LocalSettings"
import { AnySettings, SettingsStore } from "./Settings"
import { UserSettings } from "TiFShared/domain-models/User"

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
export const useLocalSettings = () => {
  const { localSettingsStore } = useSettings()
  return {
    settings: useSettingsStoreState(localSettingsStore),
    store: localSettingsStore
  }
}

/**
 * Returns the current user settings, along with the store that stores the
 * settings.
 */
export const useUserSettings = () => {
  const { userSettingsStore } = useSettings()
  return {
    settings: useSettingsStoreState(userSettingsStore),
    store: userSettingsStore
  }
}

const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("No SettingsProvider provided.")
  return context
}

const useSettingsStoreState = <Settings extends AnySettings>(
  store: SettingsStore<Settings>
) => {
  return useSyncExternalStore(
    useCallback((callback) => store.subscribe(callback), [store]),
    () => store.mostRecentlyPublished
  )
}
