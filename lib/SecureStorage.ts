import { Amplify } from "aws-amplify"
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
  }

  // set item with the key
  setItem (key: string, value: string) {
    if (!this.keyList.find((k) => k === key)) {
      this.keyList.push(key)
    }
    this.cache.set(SECURE_STORAGE_KEY_PREFIX + key, value)
    this.store.setItemAsync(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  // get item with the key
  getItem (key: string) {
    const result = this.cache.get(SECURE_STORAGE_KEY_PREFIX + key)
    return result
  }

  // remove item with the key
  removeItem (key: string) {
    this.keyList = this.keyList.filter((k) => k === key)
    this.cache.delete(SECURE_STORAGE_KEY_PREFIX + key)
    this.store.deleteItemAsync(key)
  }

  async clear () {
    return await Promise.allSettled(
      this.keyList.map(async (k) => {
        await this.store.deleteItemAsync(k)
      })
    )
  }

  async sync () {
    if (this.syncPromise) {
      return await this.syncPromise
    }
    return await Promise.allSettled(
      this.keyList.map(async (k) => {
        const storageValue = await this.store.getItemAsync(k)
        if (storageValue) {
          this.cache.set(k, storageValue)
        }
      })
    )
  }
}

Amplify.configure({
  storage: AmplifySecureStorage
})
