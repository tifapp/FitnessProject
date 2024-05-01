import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { PersistentSettingsStore, SettingsStorage } from "./PersistentStore"

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

export const DEFAULT_LOCAL_SETTINGS = {
  isHapticFeedbackEnabled: true,
  isHapticAudioEnabled: true,
  hasCompletedOnboarding: false,
  lastEventArrivalsRefreshDate: null
} as Readonly<LocalSettings>

const STORAGE_TAG = "sqlite.local.settings"

type SQLiteLocalSettings = {
  isHapticFeedbackEnabled: number
  isHapticAudioEnabled: number
  hasCompletedOnboarding: number
  lastEventArrivalsRefreshTime: number | null
}

export class SQLiteLocalSettingsStorage
  implements SettingsStorage<LocalSettings>
{
  readonly tag = STORAGE_TAG
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

export const localSettingsStore = (storage: SettingsStorage<LocalSettings>) => {
  return new PersistentSettingsStore(DEFAULT_LOCAL_SETTINGS, storage)
}
