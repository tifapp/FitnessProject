import { CallbackCollection } from "@lib/utils/CallbackCollection"
import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { SettingsStorage, areSettingsEqual } from "./Settings"

/**
 * A type for user settings that are local to the device.
 *
 * Usually, these settings depend on the device's hardware, and thus are not
 * suitable for sharing on the server.
 */
export type LocalSettings = {
  isHapticFeedbackEnabled: boolean
  isHapticAudioEnabled: boolean
  hasCompletedOnboarding: boolean
  lastEventArrivalsRefreshDate: Date | null
}

export class SQLiteLocalSettingsStorage
  implements SettingsStorage<LocalSettings>
{
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async load() {
    return await this.sqlite.withTransaction((db) => this._load(db))
  }

  async save(settings: Partial<LocalSettings>) {
    return await this.sqlite.withTransaction(async (db) => {
      const newSettings = mergeWithPartial(await this._load(db), settings)
      await db.run`
      INSERT OR REPLACE INTO LocalSettings (
        isHapticFeedbackEnabled,
        isHapticAudioEnabled,
        hasCompletedOnboarding,
        lastEventArrivalsRefreshTime
      ) VALUES (
        ${newSettings.isHapticFeedbackEnabled},
        ${newSettings.isHapticAudioEnabled},
        ${newSettings.hasCompletedOnboarding},
        ${newSettings.lastEventArrivalsRefreshDate?.getTime()}
      )
      `
    })
  }

  private async _load(db: SQLExecutable): Promise<LocalSettings> {
    const sqliteSettings = await db.queryFirst<SQLiteLocalSettings>`
      SELECT * FROM LocalSettings LIMIT 1
      `
    if (!sqliteSettings) return { ...DEFAULT_LOCAL_SETTINGS }
    return {
      isHapticAudioEnabled: sqliteSettings.isHapticAudioEnabled === 1,
      isHapticFeedbackEnabled: sqliteSettings.isHapticFeedbackEnabled === 1,
      hasCompletedOnboarding: sqliteSettings.hasCompletedOnboarding === 1,
      lastEventArrivalsRefreshDate: sqliteSettings.lastEventArrivalsRefreshTime
        ? new Date(sqliteSettings.lastEventArrivalsRefreshTime)
        : null
    }
  }
}

export const DEFAULT_LOCAL_SETTINGS = {
  isHapticFeedbackEnabled: true,
  isHapticAudioEnabled: true,
  hasCompletedOnboarding: false,
  lastEventArrivalsRefreshDate: null
} as Readonly<LocalSettings>

export type LocalSettingsStoreUnsubscribe = () => void

/**
 * An interface for storing {@link LocalSettings}.
 */
export interface LocalSettingsStore {
  /**
   * The current {@link LocalSettings} or {@link DEFAULT_LOCAL_SETTINGS}
   * if none exist. This value represents the value of the most recent
   * subscription.
   *
   * This value may not always reflect the settings persisted by the underlying
   * persistence mechanism. If you need to always have the most up to date settings
   * call `load`.
   */
  get current(): LocalSettings

  /**
   * Subscribes to updates for the device settings.
   */
  subscribe(
    callback: (settings: LocalSettings) => void
  ): LocalSettingsStoreUnsubscribe

  /**
   * Merges the given settings with the current settings and persists.
   */
  save(settings: Partial<LocalSettings>): Promise<void>

  /**
   * Loads the current {@link LocalSettings} directly from the underlying
   * storage, or returns {@link DEFAULT_LOCAL_SETTINGS} if none exist.
   *
   * This value should always return the most up to date settings, even if it
   * doesn't match `current`.
   */
  load(): Promise<LocalSettings>
}

type SQLiteLocalSettings = {
  isHapticFeedbackEnabled: number
  isHapticAudioEnabled: number
  hasCompletedOnboarding: number
  lastEventArrivalsRefreshTime: number | null
}

/**
 * {@link LocalSettingsStore} implemented with SQLite.
 */
export class SQLiteLocalSettingsStore implements LocalSettingsStore {
  private readonly sqlite: TiFSQLite
  private _current?: LocalSettings
  private settingsPromise?: Promise<void>
  private callbackCollection = new CallbackCollection<LocalSettings>()

  get current() {
    return this._current ?? DEFAULT_LOCAL_SETTINGS
  }

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  subscribe(callback: (settings: LocalSettings) => void) {
    const unsub = this.callbackCollection.add(callback)
    if (this._current) {
      callback(this._current)
    } else {
      this.loadSettingsIfNeeded()
    }
    return unsub
  }

  async save(settings: Partial<LocalSettings>) {
    const newSettings = mergeWithPartial(this.current, settings)
    this.publishNewSettingsIfDifferent(newSettings)
    await this.sqlite.withTransaction(async (db) => {
      await db.run`
      INSERT INTO LocalSettings (
        isHapticFeedbackEnabled,
        isHapticAudioEnabled,
        hasCompletedOnboarding,
        lastEventArrivalsRefreshTime
      ) VALUES (
        ${newSettings.isHapticFeedbackEnabled},
        ${newSettings.isHapticAudioEnabled},
        ${newSettings.hasCompletedOnboarding},
        ${newSettings.lastEventArrivalsRefreshDate?.getTime()}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        isHapticFeedbackEnabled = ${newSettings.isHapticFeedbackEnabled},
        isHapticAudioEnabled = ${newSettings.isHapticAudioEnabled},
        hasCompletedOnboarding = ${newSettings.hasCompletedOnboarding},
        lastEventArrivalsRefreshTime = ${newSettings.lastEventArrivalsRefreshDate?.getTime()}
      `
    })
  }

  async load() {
    return this.sqlite.withTransaction(async (db) => {
      const settings = await this.currentSettings(db)
      this.publishNewSettingsIfDifferent(settings)
      return settings
    })
  }

  private publishNewSettingsIfDifferent(newSettings: LocalSettings) {
    if (!areSettingsEqual(this.current, newSettings)) {
      this.callbackCollection.send(newSettings)
      this._current = newSettings
    }
  }

  private loadSettingsIfNeeded() {
    if (this.settingsPromise) return
    this.settingsPromise = this.sqlite.withTransaction(async (db) => {
      const settings = await this.currentSettings(db)
      this._current = this._current ?? settings
      this.callbackCollection.send(settings)
    })
  }

  private async currentSettings(db: SQLExecutable): Promise<LocalSettings> {
    const sqliteSettings = await db.queryFirst<SQLiteLocalSettings>`
      SELECT * FROM LocalSettings LIMIT 1
      `
    if (!sqliteSettings) return { ...DEFAULT_LOCAL_SETTINGS }
    return {
      isHapticAudioEnabled: sqliteSettings.isHapticAudioEnabled === 1,
      isHapticFeedbackEnabled: sqliteSettings.isHapticFeedbackEnabled === 1,
      hasCompletedOnboarding: sqliteSettings.hasCompletedOnboarding === 1,
      lastEventArrivalsRefreshDate: sqliteSettings.lastEventArrivalsRefreshTime
        ? new Date(sqliteSettings.lastEventArrivalsRefreshTime)
        : null
    }
  }
}
