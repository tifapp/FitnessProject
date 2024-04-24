export type SettingsStoreUnsubscribe = () => void

export interface SettingsStore<Settings> {
  get current(): Settings
  subscribe(callback: (settings: Settings) => void): SettingsStoreUnsubscribe
  save(settings: Partial<Settings>): void
}

export interface SettingsStorage<Settings> {
  load(): Promise<Settings>
  save(settings: Partial<Settings>): Promise<void>
}
