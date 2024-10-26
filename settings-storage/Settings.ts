import { shallowEquals } from "TiFShared/lib/ShallowEquals"
import { EventEditLocation } from "TiFShared/domain-models/Event"

export type SettingsStoreUnsubscribe = () => void

export type SettingValue =
  | string
  | boolean
  | number
  | EventEditLocation
  | SettingValue[]
  | Date
  | null

export type AnySettings = Record<string, SettingValue>

/**
 * An interface for observing settings.
 */
export interface SettingsStore<Settings extends AnySettings> {
  /**
   * Returns the most recently published settings from a subscriber.
   */
  get mostRecentlyPublished(): Settings

  /**
   * Subscribes to the store. This method should publish to new subscribers
   * immediately, and load the initial settings for the first subscriber.
   */
  subscribe(callback: (settings: Settings) => void): SettingsStoreUnsubscribe

  /**
   * Updates and publishes the new values of the settings in `partialSettings`.
   */
  update(partialSettings: Partial<Settings>): void
}

/**
 * Returns true if 2 settings objects are equal.
 */
export const areSettingsEqual = <Settings extends AnySettings>(
  s1: Settings,
  s2: Settings
) => shallowEquals(s1, s2)

/**
 * Returns a selector function that grabs the settings values for the
 * specified keys.
 */
export const settingsSelector = <
  Settings extends AnySettings,
  Keys extends (keyof Settings)[]
>(
  ...keys: Keys
) => {
  return (settings: Settings): Pick<Settings, Keys[number]> => {
    return keys.reduce((acc, key) => {
      acc[key] = settings[key]
      return acc
    }, {} as Settings) as unknown as Pick<Settings, Keys[number]>
  }
}
