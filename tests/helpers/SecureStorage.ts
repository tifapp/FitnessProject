import { SecureStore } from "@lib/SecureStorage"
import * as ExpoSecureStore from "expo-secure-store"

export class TestSecureStorage implements SecureStore {
  private TestAmplifyStore = new Map<string, string>()

  async setItemAsync (
    key: string,
    value: string,
    options?: ExpoSecureStore.SecureStoreOptions | undefined
  ) {
    this.TestAmplifyStore.set(key, value)
  }

  async getItemAsync (key: string) {
    return this.TestAmplifyStore.get(key) ?? null
  }

  async deleteItemAsync (key: string) {
    this.TestAmplifyStore.delete(key)
  }
}
