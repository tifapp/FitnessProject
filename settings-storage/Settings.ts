export type SettingsStoreUnsubscribe = () => void

export type SettingValue =
  | string
  | boolean
  | number
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
) => {
  return Object.keys(s1).every((key) => isEqualSettingValue(s1[key], s2[key]))
}

const isEqualSettingValue = (v1: SettingValue, v2: SettingValue): boolean => {
  if (v1 instanceof Date && v2 instanceof Date) {
    return v1.getTime() === v2.getTime()
  }
  if (Array.isArray(v1) && Array.isArray(v2)) {
    return v1.every((setting, index) => {
      return index <= v2.length - 1 && isEqualSettingValue(setting, v2[index])
    })
  }
  return v1 === v2
}
