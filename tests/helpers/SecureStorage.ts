import { SECURE_STORAGE_KEY_PREFIX, SecureStorage } from "@lib/SecureStorage"

export class TestSecureStorage<Store extends SecureStorage> {
  // set item with the key
  private TestAmplifyStore = new Map<string, string>()
  private store: Store

  constructor (store: Store) {
    this.store = store
  }

  setItem (key: string, value: string) {
    this.TestAmplifyStore.set(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  // get item with the key
  getItem (key: string) {
    const result = this.TestAmplifyStore.get(SECURE_STORAGE_KEY_PREFIX + key)
    return result
  }

  // remove item with the key
  removeItem (key: string) {
    this.TestAmplifyStore.delete(SECURE_STORAGE_KEY_PREFIX + key)
  }

  // clear items
  clear () {
    this.TestAmplifyStore.delete(SECURE_STORAGE_KEY_PREFIX + key)
  }
}
