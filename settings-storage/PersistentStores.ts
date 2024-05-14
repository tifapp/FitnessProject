import {
  DEFAULT_USER_SETTINGS,
  UserSettings
} from "TiFShared/domain-models/Settings"
import { DEFAULT_LOCAL_SETTINGS, LocalSettings } from "./LocalSettings"
import { PersistentSettingsStore, SettingsStorage } from "./PersistentStore"

export namespace PersistentSettingsStores {
  export const local = (storage: SettingsStorage<LocalSettings>) => {
    return new PersistentSettingsStore(DEFAULT_LOCAL_SETTINGS, storage)
  }

  export const user = (storage: SettingsStorage<UserSettings>) => {
    return new PersistentSettingsStore(DEFAULT_USER_SETTINGS, storage)
  }
}
