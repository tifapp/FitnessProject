import {
  DEFAULT_USER_SETTINGS,
  PushNotificationTriggerID,
  PushNotificationTriggerIDSchema,
  UserSettings
} from "TiFShared/domain-models/Settings"
import { PersistentSettingsStore, SettingsStorage } from "./PersistentStore"
import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { SettingsStore } from "./Settings"
import { TiFAPI } from "TiFShared/api"
import { UpdateUserSettingsRequest } from "TiFShared/api/models/User"
import { logger } from "TiFShared/logging"
import { QueryClient, MutationObserver } from "@tanstack/react-query"
import { z } from "zod"

const STORAGE_TAG = "sqlite.user.settings"

type SQLiteUserSettings = {
  id: string
  isAnalyticsEnabled: number
  isCrashReportingEnabled: number
  canShareArrivalStatus: number
  pushNotificationTriggerIds: string
  eventCalendarStartOfWeekDay: string
  eventCalendarDefaultLayout: string
  version: number
}

/**
 * {@link SettingsStorage} implemented with SQLite.
 */
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
        canShareArrivalStatus,
        pushNotificationTriggerIds,
        eventCalendarStartOfWeekDay,
        eventCalendarDefaultLayout,
        version
      ) VALUES (
        ${newSettings.isAnalyticsEnabled},
        ${newSettings.isCrashReportingEnabled},
        ${newSettings.canShareArrivalStatus},
        ${serializeTriggerIds(newSettings.pushNotificationTriggerIds)},
        ${newSettings.eventCalendarStartOfWeekDay},
        ${newSettings.eventCalendarDefaultLayout},
        ${newSettings.version}
      )
      `
    })
  }

  private async _load(db: SQLExecutable): Promise<UserSettings> {
    const dbSettings = await db.queryFirst<SQLiteUserSettings>`
      SELECT * FROM UserSettings LIMIT 1
      `
    if (!dbSettings) return { ...DEFAULT_USER_SETTINGS }
    const { id: _, ...sqliteSettings } = dbSettings
    return {
      ...(sqliteSettings as unknown as UserSettings),
      isAnalyticsEnabled: sqliteSettings.isAnalyticsEnabled === 1,
      isCrashReportingEnabled: sqliteSettings.isCrashReportingEnabled === 1,
      canShareArrivalStatus: sqliteSettings.canShareArrivalStatus === 1,
      pushNotificationTriggerIds: deserializeTriggerIds(
        sqliteSettings.pushNotificationTriggerIds
      )
    }
  }
}

const serializeTriggerIds = (triggers: PushNotificationTriggerID[]) => {
  return triggers.join(",")
}

const deserializeTriggerIds = (serializedIds: string) => {
  return z
    .array(PushNotificationTriggerIDSchema)
    .parse(serializedIds.split(","))
}

const log = logger("user.settings.synchronizing.store")

export type APIUserSettings = ReturnType<
  typeof addAPIUserSettingsExponentialBackoff
>

export const addAPIUserSettingsExponentialBackoff = (
  api: TiFAPI,
  queryClient: QueryClient,
  saveRetryCount = 3
) => {
  const saveMutation = new MutationObserver(queryClient, {
    mutationFn: async (request: UpdateUserSettingsRequest) => {
      return (await api.saveUserSettings(request)).data
    },
    retry: saveRetryCount
  })
  return {
    settings: async () => {
      return await queryClient.fetchQuery({
        queryKey: ["user-settings"],
        queryFn: async () => (await api.userSettings()).data
      })
    },
    save: saveMutation.mutate
  }
}

/**
 * An {@link SettingsStore} which synchronizes {@link UserSettings} between
 * offline local persistence, and the API.
 *
 * Every call to `update` will debounce the changes to the API, but save to
 * the local persistence immediately.
 *
 * When `refresh` is called, the store loads both the API and local settings.
 * The store then decides whether or not to push the local settings to the API,
 * or to save the API settings locally while publishing the result to all
 * subscribers.
 *
 * None of the methods on this class throw errors.
 */
export class UserSettingsSynchronizingStore
  implements SettingsStore<UserSettings>
{
  private readonly persistentStore: PersistentSettingsStore<UserSettings>
  private readonly apiSettings: APIUserSettings
  private readonly debounceMillis: number

  private debouncedRequest?: UpdateUserSettingsRequest
  private debounceTimeout?: NodeJS.Timeout

  constructor(
    persistentStore: PersistentSettingsStore<UserSettings>,
    apiSettings: APIUserSettings,
    debounceMillis: number
  ) {
    this.persistentStore = persistentStore
    this.apiSettings = apiSettings
    this.debounceMillis = debounceMillis
  }

  get mostRecentlyPublished() {
    return this.persistentStore.mostRecentlyPublished
  }

  subscribe(callback: (settings: UserSettings) => void) {
    return this.persistentStore.subscribe(callback)
  }

  update(partialSettings: Partial<UserSettings>): void {
    this.persistentStore.update(partialSettings)
    clearTimeout(this.debounceTimeout)
    this.debouncedRequest = { ...this.debouncedRequest, ...partialSettings }
    this.debounceTimeout = setTimeout(
      () => this.flushPendingChanges(),
      this.debounceMillis
    )
  }

  async flushPendingChanges() {
    if (!this.debouncedRequest) return
    const pendingRequest = this.debouncedRequest
    this.clearDebouncedUpdate()
    await this.pushSettings(pendingRequest)
  }

  async refresh() {
    this.clearDebouncedUpdate()
    const [localResult, remoteResult] = await Promise.allSettled([
      this.persistentStore.persistedSettings(),
      this.apiSettings.settings()
    ])
    if (remoteResult.status === "rejected") {
      log.warn("Failed to retrieve user settings from the API.", {
        error: remoteResult.reason,
        message: remoteResult.reason.message
      })
    }
    const action = userSettingsRefreshAction(localResult, remoteResult)
    this.persistentStore.update(action.settings)
    if (action.status === "push-local") {
      const { version: _, ...settings } = action.settings
      await this.pushSettings(settings)
    }
  }

  private clearDebouncedUpdate() {
    clearTimeout(this.debounceTimeout)
    this.debouncedRequest = undefined
  }

  private async pushSettings(request: UpdateUserSettingsRequest) {
    try {
      const settings = await this.apiSettings.save(request)
      this.persistentStore.update(settings)
    } catch (err) {
      log.warn("Failed to push user settings to API.", {
        error: err,
        message: err.message
      })
    }
  }
}

export type UserSettingsLoadResult =
  | PromiseFulfilledResult<UserSettings>
  | { status: "rejected" }

export const userSettingsRefreshAction = (
  local: UserSettingsLoadResult,
  remote: UserSettingsLoadResult
) => {
  if (local.status === "rejected" && remote.status === "fulfilled") {
    return { status: "pull-remote", settings: remote.value } as const
  } else if (local.status === "fulfilled" && remote.status === "rejected") {
    return { status: "no-push-local", settings: local.value } as const
  } else if (local.status === "fulfilled" && remote.status === "fulfilled") {
    return local.value.version >= remote.value.version
      ? ({ status: "push-local", settings: local.value } as const)
      : ({ status: "pull-remote", settings: remote.value } as const)
  }
  return { status: "neither", settings: DEFAULT_USER_SETTINGS } as const
}

/**
 * A convenience function to create an {@link UserSettingsSynchronizingStore}.
 */
export const userSettingsStore = (
  storage: SettingsStorage<UserSettings>,
  api: TiFAPI,
  queryClient: QueryClient,
  debounceMillis = 5000,
  apiSaveRetryCount = 3
) => {
  return new UserSettingsSynchronizingStore(
    userSettingsPersistentStore(storage),
    addAPIUserSettingsExponentialBackoff(api, queryClient, apiSaveRetryCount),
    debounceMillis
  )
}

export const userSettingsPersistentStore = (
  storage: SettingsStorage<UserSettings>
) => {
  return new PersistentSettingsStore(DEFAULT_USER_SETTINGS, storage)
}
