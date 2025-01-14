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
  readonly map = new Map<string, string>()

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
