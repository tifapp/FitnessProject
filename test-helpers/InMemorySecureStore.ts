import { SecureStore } from "@lib/SecureStore"

/**
 * An in memory secure storage useful for testing and storybook.
 */
export class InMemorySecureStore implements SecureStore {
  private map = new Map<string, string>()

  async setItemAsync (key: string, value: string) {
    this.map.set(key, value)
  }

  async getItemAsync (key: string) {
    return this.map.get(key) ?? null
  }

  async deleteItemAsync (key: string) {
    this.map.delete(key)
  }

  clear () {
    this.map = new Map()
  }
}
