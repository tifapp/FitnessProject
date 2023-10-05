import "@lib/Promise"

/**
 * An interface for expo secure storage functions.
 */
export interface SecureStore {
  getItemAsync(key: string): Promise<string | null>
  deleteItemAsync(key: string): Promise<void>
  setItemAsync(key: string, value: string): Promise<void>
}

const SECURE_STORAGE_KEY_PREFIX = "secureStorage"
const KEYLIST_PREFIX = "secureStorageKeyList"

/**
 * Secure storage for AWS Cognito Auth.
 */
export class AmplifySecureStorage<Store extends SecureStore> {
  private syncPromise?: Promise<void>
  private store: Store
  private keyList = [] as string[]
  private cache = new Map<string, string>()

  constructor (store: Store) {
    this.store = store
  }

  setItem (key: string, value: string) {
    if (!this.keyList.find((k) => k === key)) {
      this.keyList.push(key)
    }
    this.cache.set(SECURE_STORAGE_KEY_PREFIX + key, value)
    this.store.setItemAsync(KEYLIST_PREFIX, JSON.stringify(this.keyList))
    this.store.setItemAsync(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  getItem (key: string) {
    return this.cache.get(SECURE_STORAGE_KEY_PREFIX + key)
  }

  removeItem (key: string) {
    this.keyList = this.keyList.filter((k) => k !== key)
    this.store.setItemAsync(KEYLIST_PREFIX, JSON.stringify(this.keyList))
    this.cache.delete(SECURE_STORAGE_KEY_PREFIX + key)
    this.store.deleteItemAsync(SECURE_STORAGE_KEY_PREFIX + key)
  }

  async clear () {
    const fullPromise = await Promise.allSettled(
      this.keyList.map(async (k) => {
        await this.store.deleteItemAsync(SECURE_STORAGE_KEY_PREFIX + k)
      })
    )
    this.keyList = []
    this.cache = new Map<string, string>()
    return fullPromise
  }

  async sync () {
    if (this.syncPromise) {
      return await this.syncPromise
    }
    const result = await this.store.getItemAsync(KEYLIST_PREFIX)
    if (result) {
      this.keyList = JSON.parse(result)
    }
    await Promise.allSettled(
      this.keyList.map(async (k) => {
        const storageValue = await this.store.getItemAsync(
          SECURE_STORAGE_KEY_PREFIX + k
        )
        if (storageValue) {
          this.cache.set(SECURE_STORAGE_KEY_PREFIX + k, storageValue)
        }
      })
    )
  }
}
