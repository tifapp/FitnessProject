export type SettingsStoreUnsubscribe = () => void

export type SettingValue = string | boolean | number | Date | null

export type AnySettings = Record<string, SettingValue>

export interface SettingsStore<Settings extends AnySettings> {
  get current(): Settings
  subscribe(callback: (settings: Settings) => void): SettingsStoreUnsubscribe
  save(settings: Partial<Settings>): void
}

export interface SettingsStorage<Settings extends AnySettings> {
  load(): Promise<Settings>
  save(settings: Partial<Settings>): Promise<void>
}

/**
 * Returns true if 2 settings objects are equal.
 */
export const areSettingsEqual = <Settings extends AnySettings>(
  s1: Settings,
  s2: Settings
) => {
  return Object.keys(s1).every((key) => {
    const [v1, v2] = [s1[key], s2[key]]
    if (v1 instanceof Date && v2 instanceof Date) {
      return v1.getTime() === v2.getTime()
    }
    return v1 === v2
  })
}
