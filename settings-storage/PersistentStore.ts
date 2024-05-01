import { mergeWithPartial } from "TiFShared/lib/Object"
import { AnySettings, SettingsStore, areSettingsEqual } from "./Settings"
import { CallbackCollection } from "@lib/utils/CallbackCollection"
import { logger } from "TiFShared/logging"

/**
 * An interface for storing settings.
 */
export interface SettingsStorage<Settings extends AnySettings> {
  /**
   * A unique identifier of this storage instance used for logging.
   */
  get tag(): string

  /**
   * Loads the current settings from the storage.
   */
  load(): Promise<Settings>

  /**
   * Saves the new values of the settings in `partialSettings`.
   */
  save(partialSettings: Partial<Settings>): Promise<void>
}

const log = logger("persistent.settings.store")

/**
 * An {@link SettingsStore} implementation which loads and saves settings to
 * a persistent backing store that implements {@link SettingsStorage}.
 */
export class PersistentSettingsStore<Settings extends AnySettings>
  implements SettingsStore<Settings>
{
  private readonly defaultSettings: Settings
  private readonly storage: SettingsStorage<Settings>

  private currentSettings?: Settings
  private subscribers = new CallbackCollection<Settings>()
  private initialLoadPromise?: Promise<void>

  constructor(defaultSettings: Settings, storage: SettingsStorage<Settings>) {
    this.defaultSettings = defaultSettings
    this.storage = storage
  }

  get mostRecentlyPublished() {
    return this.currentSettings ?? this.defaultSettings
  }

  subscribe(callback: (settings: Settings) => void) {
    const unsub = this.subscribers.add(callback)
    if (this.currentSettings) {
      callback(this.currentSettings)
    } else {
      this.performInitialLoadIfNeeded()
    }
    return unsub
  }

  update(settings: Partial<Settings>): void {
    this.storage.save(settings).catch((err) => {
      log.warn(
        "Failed to save settings to the underlying storage",
        this.errorLogMetadata(err)
      )
    })
    const newSettings = mergeWithPartial(this.mostRecentlyPublished, settings)
    if (!areSettingsEqual(this.mostRecentlyPublished, newSettings)) {
      this.currentSettings = newSettings
      this.subscribers.send(newSettings)
    }
  }

  private performInitialLoadIfNeeded() {
    if (this.initialLoadPromise) return
    this.initialLoadPromise = this.storage
      .load()
      .then((settings) => {
        this.currentSettings = settings
        this.subscribers.send(settings)
      })
      .catch((err) => {
        log.warn(
          "Failed to load settings from underlying storage.",
          this.errorLogMetadata(err)
        )
        this.subscribers.send(this.defaultSettings)
      })
  }

  private errorLogMetadata(err: Record<string, any>) {
    return {
      error: err,
      message: err.message,
      code: err.code,
      storageTag: this.storage.tag
    }
  }
}
