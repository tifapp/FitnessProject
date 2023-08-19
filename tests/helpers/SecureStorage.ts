import { StorageManagement } from "@lib/SecureStorage"

/**
 * Mock implementation of SecureStorage for testing purposes.
 * Utilises a Map to emulate storage behaviour.
 */
export class TestSecureStorage implements StorageManagement<string | null> {
  // set item with the key
  private _currentStorage = new Map()

  get currentStorage () {
    return this._currentStorage
  }

  // set item with the key
  async setItem (key: string, value: string) {
    this._currentStorage.set(key, value)
  }

  // get item with the key
  async getItem (key: string) {
    const result = this._currentStorage.get(key)
    console.log(result)
    if (result) {
      return result
    } else {
      return null
    }
  }

  // remove item with the key
  async removeItem (key: string) {
    this._currentStorage.delete(key)
  }

  // clear items
  clear () {
    this._currentStorage = new Map()
  }
}
