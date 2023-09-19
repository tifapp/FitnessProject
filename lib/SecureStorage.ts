import * as ExpoSecureStore from "expo-secure-store"

export type SecureStorage = typeof ExpoSecureStore

export const SECURE_STORAGE_KEY_PREFIX = "@SecureStorage:"

export class AmplifySecureStorage<Store extends SecureStorage> {
  private syncPromise?: Promise<void>
  private store: Store
  private keyList: string[]
  private cache = new Map<string, string>()

  constructor (store: Store) {
    this.store = store
    this.keyList = []
  }

  setItem (key: string, value: string) {
    if (!this.keyList.find((k) => k === key)) {
      this.keyList.push(key)
    }
    this.cache.set(SECURE_STORAGE_KEY_PREFIX + key, value)
    this.store.setItemAsync("KeyList", JSON.stringify(this.keyList))
    this.store.setItemAsync(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  getItem (key: string) {
    return this.cache.get(SECURE_STORAGE_KEY_PREFIX + key)
  }

  removeItem (key: string) {
    this.keyList = this.keyList.filter((k) => k === key)
    this.store.setItemAsync("KeyList", JSON.stringify(this.keyList))
    this.cache.delete(SECURE_STORAGE_KEY_PREFIX + key)
    this.store.deleteItemAsync(SECURE_STORAGE_KEY_PREFIX + key)
  }

  async clear () {
    const fullPromise = await Promise.all(
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
    const result = await this.store.getItemAsync("KeyList")
    if (result) {
      this.keyList = JSON.parse(result)
    }
    return await Promise.all(
      this.keyList.map(async (k) => {
        const storageValue = await this.store.getItemAsync(
          SECURE_STORAGE_KEY_PREFIX + k
        )
        if (storageValue) {
          console.log("Storage Value: " + storageValue)
          this.cache.set(SECURE_STORAGE_KEY_PREFIX + k, storageValue)
        } else {
          console.log("Storage Value for key " + k + "is null.")
        }
      })
    )
  }
}

// Amplify.configure({
//   storage: AmplifySecureStorage
// })
