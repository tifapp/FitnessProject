import { mergeWithPartial } from "TiFShared/lib/Object"
import {
  AnySettings,
  SettingsStorage,
  SettingsStore,
  areSettingsEqual
} from "./Settings"
import { CallbackCollection } from "@lib/utils/CallbackCollection"
import { logger } from "TiFShared/logging"

const log = logger("persistent.settings.store")

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

  get current() {
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

  save(settings: Partial<Settings>): void {
    this.storage.save(settings).catch((err) => {
      log.warn(
        "Failed to save settings to the underlying storage",
        this.errorLogMetadata(err)
      )
    })
    const newSettings = mergeWithPartial(this.current, settings)
    if (!areSettingsEqual(this.current, newSettings)) {
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
