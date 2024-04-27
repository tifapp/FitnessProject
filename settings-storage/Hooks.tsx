import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore
} from "react"
import { LocalSettingsStore } from "./LocalSettings"

const SettingsContext = createContext<
  { localStore: LocalSettingsStore } | undefined
>(undefined)

export type SettingsProviderProps = {
  localStore: LocalSettingsStore
  children: JSX.Element
}

export const SettingsProvider = ({
  localStore,
  children
}: SettingsProviderProps) => (
  <SettingsContext.Provider value={{ localStore }}>
    {children}
  </SettingsContext.Provider>
)

/**
 * Returns the current device settings, along with the store that stores the
 * settings.
 */
export const useLocalSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("No LocalSettingsStore provided.")
  return {
    settings: useSyncExternalStore(
      useCallback(
        (callback) => context.localStore.subscribe(callback),
        [context.localStore]
      ),
      () => context.localStore.current
    ),
    store: context.localStore
  }
}
