import {
  DEFAULT_USER_SETTINGS,
  UserSettings
} from "TiFShared/domain-models/User"
import { SettingsStorage } from "./PersistentStore"
import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"

const STORAGE_TAG = "sqlite.user.settings"

type SQLiteUserSettings = {
  isAnalyticsEnabled: number
  isCrashReportingEnabled: number
  isEventNotificationsEnabled: number
  isMentionsNotificationsEnabled: number
  isChatNotificationsEnabled: number
  isFriendRequestNotificationsEnabled: number
  canShareArrivalStatus: number
  version: number
}

export class SQLiteUserSettingsStorage
  implements SettingsStorage<UserSettings>
{
  readonly tag = STORAGE_TAG
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async load() {
    return await this.sqlite.withTransaction((db) => this._load(db))
  }

  async save(settings: Partial<UserSettings>) {
    return await this.sqlite.withTransaction(async (db) => {
      const newSettings = mergeWithPartial(await this._load(db), settings)
      await db.run`
      INSERT OR REPLACE INTO UserSettings (
        isAnalyticsEnabled,
        isCrashReportingEnabled,
        isEventNotificationsEnabled,
        isMentionsNotificationsEnabled,
        isChatNotificationsEnabled,
        isFriendRequestNotificationsEnabled,
        canShareArrivalStatus,
        version
      ) VALUES (
        ${newSettings.isAnalyticsEnabled},
        ${newSettings.isCrashReportingEnabled},
        ${newSettings.isEventNotificationsEnabled},
        ${newSettings.isMentionsNotificationsEnabled},
        ${newSettings.isChatNotificationsEnabled},
        ${newSettings.isFriendRequestNotificationsEnabled},
        ${newSettings.canShareArrivalStatus},
        ${newSettings.version}
      )
      `
    })
  }

  private async _load(db: SQLExecutable): Promise<UserSettings> {
    const sqliteSettings = await db.queryFirst<SQLiteUserSettings>`
      SELECT * FROM UserSettings LIMIT 1
      `
    if (!sqliteSettings) return { ...DEFAULT_USER_SETTINGS }
    return {
      isAnalyticsEnabled: sqliteSettings.isAnalyticsEnabled === 1,
      isCrashReportingEnabled: sqliteSettings.isCrashReportingEnabled === 1,
      isEventNotificationsEnabled:
        sqliteSettings.isEventNotificationsEnabled === 1,
      isMentionsNotificationsEnabled:
        sqliteSettings.isMentionsNotificationsEnabled === 1,
      isChatNotificationsEnabled:
        sqliteSettings.isChatNotificationsEnabled === 1,
      isFriendRequestNotificationsEnabled:
        sqliteSettings.isFriendRequestNotificationsEnabled === 1,
      canShareArrivalStatus: sqliteSettings.canShareArrivalStatus === 1,
      version: sqliteSettings.version
    }
  }
}
