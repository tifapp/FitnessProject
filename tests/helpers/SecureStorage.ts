import { SECURE_STORAGE_KEY_PREFIX, SecureStorage } from "@lib/SecureStorage"

export class TestSecureStorage<Store extends SecureStorage> {
  private TestAmplifyStore = new Map<string, string>()
  private store: Store

  constructor (store: Store) {
    this.store = store
  }

  setItem (key: string, value: string) {
    this.TestAmplifyStore.set(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  getItem (key: string) {
    return this.TestAmplifyStore.get(SECURE_STORAGE_KEY_PREFIX + key)
  }

  removeItem (key: string) {
    this.TestAmplifyStore.delete(SECURE_STORAGE_KEY_PREFIX + key)
  }

  // clear items
  clear () {
    this.TestAmplifyStore = new Map()
  }
}
