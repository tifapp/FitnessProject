import "@lib/utils/Promise"
import { repeatElements } from "TiFShared/lib/Array"
import * as ExpoSecureStore from "expo-secure-store"

/**
 * An interface for expo secure storage functions.
 */
export type SecureStore = Pick<
  typeof ExpoSecureStore,
  "getItemAsync" | "setItemAsync" | "deleteItemAsync"
>

/**
 * An in memory secure storage useful for testing and storybook.
 */
export class InMemorySecureStore implements SecureStore {
  private readonly map = new Map<string, string>()

  async setItemAsync(key: string, value: string) {
    this.map.set(key, value)
  }

  async getItemAsync(key: string) {
    return this.map.get(key) ?? null
  }

  async deleteItemAsync(key: string) {
    this.map.delete(key)
  }
}

const SECURE_STORAGE_KEY_PREFIX = "secureStorage"
const KEY_CHUNK_MAPPINGS_KEY = SECURE_STORAGE_KEY_PREFIX + "KeyList"
const STORE_CHUNK_SIZE = 2048

/**
 * Encrypted secure storage for AWS Cognito Auth.
 */
export class CognitoSecureStorage {
  private syncPromise?: Promise<void>
  private store: SecureStore
  private keyChunkMappings = new Map<string, number>()
  private cache = new Map<string, string>()

  constructor(store: SecureStore) {
    this.store = store
  }

  setItem(key: string, value: string) {
    const chunks = stringToChunks(value)
    this.keyChunkMappings.set(key, chunks.length)
    this.saveKeyChunkMappings()
    this.cache.set(key, value)
    for (let i = 0; i < chunks.length; i++) {
      this.store.setItemAsync(secureStoreKey(key, i), chunks[i])
    }
  }

  getItem(key: string) {
    return this.cache.get(key)
  }

  removeItem(key: string) {
    this.cache.delete(key)

    const amountOfChunks = this.keyChunkMappings.get(key) ?? 0
    for (let i = 0; i < amountOfChunks; i++) {
      this.store.deleteItemAsync(secureStoreKey(key, i))
    }

    this.keyChunkMappings.delete(key)
    this.saveKeyChunkMappings()
  }

  async clear() {
    await Promise.allSettled(
      Array.from(this.keyChunkMappings).map(async ([key, amountOfChunks]) => {
        const promises = repeatElements(amountOfChunks, (chunkIndex) => {
          return this.store.deleteItemAsync(secureStoreKey(key, chunkIndex))
        })
        await Promise.allSettled(promises)
      })
    )
    this.keyChunkMappings = new Map()
    await this.saveKeyChunkMappings()
    this.cache = new Map()
  }

  async sync() {
    if (this.syncPromise) {
      return await this.syncPromise
    }
    this.syncPromise = this.syncKnownKeys()
    return await this.syncPromise
  }

  private async syncKnownKeys() {
    await this.loadKeyChunkMappings()
    await Promise.allSettled(
      Array.from(this.keyChunkMappings).map(async ([key, amountOfChunks]) => {
        const loadPromises = repeatElements(amountOfChunks, (i) => {
          return this.store.getItemAsync(secureStoreKey(key, i))
        })
        const value = (await Promise.allSettled(loadPromises)).ext
          .compactMap((result) => {
            if (result.status === "rejected") return undefined
            return result.value
          })
          .join("")
        this.cache.set(key, value)
      })
    )
  }

  private async loadKeyChunkMappings() {
    const result = await this.store.getItemAsync(KEY_CHUNK_MAPPINGS_KEY)
    if (result) {
      this.keyChunkMappings = new Map(JSON.parse(result))
    }
  }

  private async saveKeyChunkMappings() {
    await this.store.setItemAsync(
      KEY_CHUNK_MAPPINGS_KEY,
      JSON.stringify(Array.from(this.keyChunkMappings))
    )
  }
}

const stringToChunks = (data: string) => {
  const numChunks = Math.ceil(data.length / STORE_CHUNK_SIZE)
  return repeatElements(numChunks, (i) => {
    return data.slice(i * STORE_CHUNK_SIZE, (i + 1) * STORE_CHUNK_SIZE)
  })
}

const secureStoreKey = (name: string, chunkIndex: number) => {
  return SECURE_STORAGE_KEY_PREFIX + name + `___chunk${chunkIndex}`
}
