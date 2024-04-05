import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore
} from "react"
import { CallbackCollection } from "./CallbackCollection"
import { SQLExecutable, TiFSQLite } from "./SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"

/**
 * A type for user settings that are local to the device.
 *
 * Usually, these settings depend on the device's hardware, and thus are not
 * suitable for sharing on the server.
 */
export type DeviceSettings = {
  isHapticFeedbackEnabled: boolean
  isHapticAudioEnabled: boolean
}

export const areDeviceSettingsEqual = (
  s1: DeviceSettings,
  s2: DeviceSettings
) => {
  return (
    s1.isHapticFeedbackEnabled === s2.isHapticFeedbackEnabled &&
    s1.isHapticAudioEnabled === s2.isHapticAudioEnabled
  )
}

export const DEFAULT_DEVICE_SETTINGS = {
  isHapticFeedbackEnabled: true,
  isHapticAudioEnabled: true
} as Readonly<DeviceSettings>

export type DeviceSettingsUnsubscribe = () => void

/**
 * An interface for storing {@link DeviceSettings}.
 */
export interface DeviceSettingsStore {
  /**
   * The current {@link DeviceSettings} or {@link DEFAULT_DEVICE_SETTINGS}
   * if none exist.
   */
  get current(): DeviceSettings

  /**
   * Subscribes to updates for the device settings.
   */
  subscribe(
    callback: (settings: DeviceSettings) => void
  ): DeviceSettingsUnsubscribe

  /**
   * Merges the given settings with the current settings and persists.
   */
  save(settings: Partial<DeviceSettings>): Promise<void>
}

type SQLiteDeviceSettings = {
  isHapticFeedbackEnabled: number
  isHapticAudioEnabled: number
}

/**
 * {@link DeviceSettings} implemented with SQLite.
 */
export class SQLiteDeviceSettingsStore implements DeviceSettingsStore {
  private readonly sqlite: TiFSQLite
  private _settings?: DeviceSettings
  private settingsPromise?: Promise<void>
  private callbackCollection = new CallbackCollection<DeviceSettings>()

  get current() {
    return this._settings ?? DEFAULT_DEVICE_SETTINGS
  }

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  subscribe(callback: (settings: DeviceSettings) => void) {
    const unsub = this.callbackCollection.add(callback)
    if (this._settings) {
      callback(this._settings)
    } else {
      this.loadSettingsIfNeeded()
    }
    return unsub
  }

  async save(settings: Partial<DeviceSettings>) {
    const newSettings = mergeWithPartial(this.current, settings)
    if (areDeviceSettingsEqual(this.current, newSettings)) return
    this.callbackCollection.send(newSettings)
    this._settings = newSettings
    await this.sqlite.withTransaction(async (db) => {
      await db.run`
      INSERT INTO DeviceSettings (
        isHapticFeedbackEnabled,
        isHapticAudioEnabled
      ) VALUES (
        ${newSettings.isHapticFeedbackEnabled},
        ${newSettings.isHapticAudioEnabled}
      )
      ON CONFLICT(id)
      DO UPDATE SET
        isHapticFeedbackEnabled = ${newSettings.isHapticFeedbackEnabled},
        isHapticAudioEnabled = ${newSettings.isHapticAudioEnabled}
      `
    })
  }

  private loadSettingsIfNeeded() {
    if (this.settingsPromise) return
    this.settingsPromise = this.sqlite.withTransaction(async (db) => {
      const settings = await this.currentSettings(db)
      this._settings = this._settings ?? settings
      this.callbackCollection.send(settings)
    })
  }

  private async currentSettings(db: SQLExecutable) {
    const sqliteSettings = await db.queryFirst<SQLiteDeviceSettings>`
      SELECT * FROM DeviceSettings LIMIT 1
      `
    if (!sqliteSettings) return { ...DEFAULT_DEVICE_SETTINGS }
    return {
      isHapticAudioEnabled: sqliteSettings.isHapticAudioEnabled === 1,
      isHapticFeedbackEnabled: sqliteSettings.isHapticFeedbackEnabled === 1
    }
  }
}

const DeviceSettingsContext = createContext<DeviceSettingsStore | undefined>(
  undefined // TODO: - Default Value
)

export type DeviceSettingsProviderProps = {
  store: DeviceSettingsStore
  children: JSX.Element
}

export const DeviceSettingsProvider = ({
  store,
  children
}: DeviceSettingsProviderProps) => (
  <DeviceSettingsContext.Provider value={store}>
    {children}
  </DeviceSettingsContext.Provider>
)

/**
 * Returns the current device settings, along with the store that stores the
 * settings.
 */
export const useDeviceSettings = () => {
  const store = useContext(DeviceSettingsContext)
  if (!store) throw new Error("No DeviceSettingsStore provided.")
  return {
    settings: useSyncExternalStore(
      useCallback((callback) => store.subscribe(callback), [store]),
      () => store.current
    ),
    store
  }
}
