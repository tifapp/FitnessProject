import { KeyValueStorageInterface } from "@aws-amplify/core"
import { ArrayUtils } from "@lib/utils/Array"
import "@lib/utils/Promise"
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

  async setItemAsync (key: string, value: string) {
    this.map.set(key, value)
  }

  async getItemAsync (key: string) {
    return this.map.get(key) ?? null
  }

  async deleteItemAsync (key: string) {
    this.map.delete(key)
  }
}

const SECURE_STORAGE_KEY_PREFIX = "secureStorage"
const KEY_CHUNK_MAPPINGS_KEY = SECURE_STORAGE_KEY_PREFIX + "KeyList"
const STORE_CHUNK_SIZE = 2048

/**
 * Encrypted secure storage for AWS Cognito Auth.
 */
export class CognitoSecureStorage implements KeyValueStorageInterface {
  private store: SecureStore
  private keyChunkMappings?: Map<string, number>
  private keyChunkMappingsPromise?: Promise<Map<string, number>>

  constructor (store: SecureStore) {
    this.store = store
    this.keyChunkMappingsPromise = undefined
    this.keyChunkMappings = undefined
  }

  async removeItem (key: string) {
    const keyChunkMappings = await this.loadKeyChunkMappings()
    const amountOfChunks = keyChunkMappings.get(key) ?? 0
    await Promise.allSettled(
      ArrayUtils.repeatElements(amountOfChunks, async (chunkIndex) => {
        await this.store.deleteItemAsync(this.secureStoreKey(key, chunkIndex))
      })
    )
    keyChunkMappings.delete(key)
    this.keyChunkMappings = keyChunkMappings
    await this.saveKeyChunkMappings()
  }

  async setItem (key: string, value: string) {
    const keyChunkMappings = await this.loadKeyChunkMappings()
    const chunks = this.stringToChunks(value)
    await Promise.allSettled(
      ArrayUtils.repeatElements(chunks.length, async (chunkIndex) => {
        return await this.store.setItemAsync(
          this.secureStoreKey(key, chunkIndex),
          chunks[chunkIndex]
        )
      })
    )
    keyChunkMappings.set(key, chunks.length)
    this.keyChunkMappings = keyChunkMappings
    await this.saveKeyChunkMappings()
  }

  async getItem (key: string) {
    const keyChunkMappings = await this.loadKeyChunkMappings()
    if (keyChunkMappings.size > 0) {
      const amountOfChunks = keyChunkMappings.get(key) ?? 0
      const results = await Promise.allSettled(
        ArrayUtils.repeatElements(amountOfChunks, async (chunkIndex) => {
          return await this.store.getItemAsync(
            this.secureStoreKey(key, chunkIndex)
          )
        })
      )
      const chunks = results
        .filter(
          (result) =>
            result.status === "fulfilled" && result.value !== undefined
        )
        .map((result) => (result as { value?: string }).value)
      if (chunks.length === 0) {
        return null
      }
      return chunks.join("")
    } else {
      return null
    }
  }

  async clear () {
    const keyChunkMappings = await this.loadKeyChunkMappings()
    await Promise.allSettled(
      Array.from(keyChunkMappings).map(async ([key, amountOfChunks]) => {
        await Promise.allSettled(
          ArrayUtils.repeatElements(amountOfChunks, async (chunkIndex) => {
            await this.store.deleteItemAsync(
              this.secureStoreKey(key, chunkIndex)
            )
          })
        )
      })
    )
    this.keyChunkMappings = undefined
    await this.saveKeyChunkMappings()
  }

  private async loadKeyChunkMappings () {
    if (this.keyChunkMappings) {
      return this.keyChunkMappings
    }
    if (this.keyChunkMappingsPromise) {
      return await this.keyChunkMappingsPromise
    }
    const loadPromise = this.store
      .getItemAsync(KEY_CHUNK_MAPPINGS_KEY)
      .then((jsonMap) => {
        if (!jsonMap) {
          this.keyChunkMappings = new Map<string, number>()
          return this.keyChunkMappings
        }
        this.keyChunkMappings = new Map<string, number>(JSON.parse(jsonMap))
        return this.keyChunkMappings
      })
    this.keyChunkMappingsPromise = loadPromise
    return await loadPromise
  }

  private async saveKeyChunkMappings () {
    if (this.keyChunkMappings) {
      await this.store.setItemAsync(
        KEY_CHUNK_MAPPINGS_KEY,
        JSON.stringify(Array.from(this.keyChunkMappings))
      )
    } else {
      await this.store.setItemAsync(
        KEY_CHUNK_MAPPINGS_KEY,
        JSON.stringify(Array.from(new Map<string, number>()))
      )
      this.keyChunkMappingsPromise = undefined
    }
  }

  private stringToChunks = (data: string) => {
    const numChunks = Math.ceil(data.length / STORE_CHUNK_SIZE)
    const chunks = [] as string[]
    for (let i = 0; i < numChunks; i++) {
      chunks.push(data.slice(i * STORE_CHUNK_SIZE, (i + 1) * STORE_CHUNK_SIZE))
    }
    return chunks
  }

  private secureStoreKey = (name: string, chunkIndex: number) => {
    const key = SECURE_STORAGE_KEY_PREFIX + name + `___chunk${chunkIndex}`
    return key
  }
}
