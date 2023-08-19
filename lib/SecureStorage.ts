import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store"

export interface StorageManagement<T> {
  setItem(key: string, value: T): Promise<void>
  getItem(key: string): Promise<T>
  removeItem(key: string): Promise<void>
  clear(): void
}

export class SecureStorage implements StorageManagement<string | null> {
  // set item with the key
  async setItem (key: string, value: string) {
    await setItemAsync(key, value)
  }

  // get item with the key
  async getItem (key: string) {
    const result = await getItemAsync(key)
    console.log(result)
    if (result) {
      return result
    } else {
      return null
    }
  }

  // remove item with the key
  async removeItem (key: string) {
    await deleteItemAsync(key)
  }

  clear () {
    console.log("Data cleared.")
  }
}
