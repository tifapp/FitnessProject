/**
 * Mock implementation of SecureStorage for testing purposes.
 * Utilises a Map to emulate storage behaviour.
 */
export class TestSecureStorage {
  // set item with the key
  static _currentStorage = new Map()

  // set item with the key
  static setItem (key: string, value: string) {
    this._currentStorage.set(key, value)
  }

  // get item with the key
  static getItem (key: string) {
    const result = this._currentStorage.get(key)
    return result
  }

  // remove item with the key
  static removeItem (key: string) {
    this._currentStorage.delete(key)
  }

  // clear items
  static clear () {
    this._currentStorage = new Map()
  }
}
