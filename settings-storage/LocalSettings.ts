import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { PersistentSettingsStore, SettingsStorage } from "./PersistentStore"

export type UserInterfaceStyle = "light" | "dark" | "system"
export type PreferredFontFamily = "OpenSans" | "OpenDyslexic3"
export type PreferredBrowserName = "in-app" | "system-default"

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
  userInterfaceStyle: UserInterfaceStyle
  preferredFontFamily: PreferredFontFamily
  preferredBrowserName: PreferredBrowserName
  isUsingSafariReaderMode: boolean
  lastEventArrivalsRefreshDate: Date | null
}

export const DEFAULT_LOCAL_SETTINGS = {
  isHapticFeedbackEnabled: true,
  isHapticAudioEnabled: true,
  hasCompletedOnboarding: false,
  userInterfaceStyle: "system",
  preferredFontFamily: "OpenSans",
  preferredBrowserName: "in-app",
  isUsingSafariReaderMode: false,
  lastEventArrivalsRefreshDate: null
} satisfies Readonly<LocalSettings> as Readonly<LocalSettings>

const STORAGE_TAG = "sqlite.local.settings"

type SQLiteLocalSettings = {
  id: string
  isHapticFeedbackEnabled: number
  isHapticAudioEnabled: number
  hasCompletedOnboarding: number
  isUsingSafariReaderMode: number
  userInterfaceStyle: UserInterfaceStyle
  preferredFontFamily: PreferredFontFamily
  preferredBrowserName: PreferredBrowserName
  lastEventArrivalsRefreshDate: number | null
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
        lastEventArrivalsRefreshDate,
        userInterfaceStyle,
        preferredFontFamily,
        preferredBrowserName,
        isUsingSafariReaderMode
      ) VALUES (
        ${newSettings.isHapticFeedbackEnabled},
        ${newSettings.isHapticAudioEnabled},
        ${newSettings.hasCompletedOnboarding},
        ${newSettings.lastEventArrivalsRefreshDate?.getTime()},
        ${newSettings.userInterfaceStyle},
        ${newSettings.preferredFontFamily},
        ${newSettings.preferredBrowserName},
        ${newSettings.isUsingSafariReaderMode}
      )
      `
    })
  }

  private async _load(db: SQLExecutable): Promise<LocalSettings> {
    const dbSettings = await db.queryFirst<SQLiteLocalSettings>`
      SELECT * FROM LocalSettings LIMIT 1
      `
    if (!dbSettings) return { ...DEFAULT_LOCAL_SETTINGS }
    const { id: _, ...sqliteSettings } = dbSettings
    return {
      ...sqliteSettings,
      isHapticAudioEnabled: sqliteSettings.isHapticAudioEnabled === 1,
      isHapticFeedbackEnabled: sqliteSettings.isHapticFeedbackEnabled === 1,
      hasCompletedOnboarding: sqliteSettings.hasCompletedOnboarding === 1,
      isUsingSafariReaderMode: sqliteSettings.isUsingSafariReaderMode === 1,
      lastEventArrivalsRefreshDate: sqliteSettings.lastEventArrivalsRefreshDate
        ? new Date(sqliteSettings.lastEventArrivalsRefreshDate)
        : null
    }
  }
}

export const localSettingsStore = (storage: SettingsStorage<LocalSettings>) => {
  return new PersistentSettingsStore(DEFAULT_LOCAL_SETTINGS, storage)
}
