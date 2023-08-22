import { Amplify } from "aws-amplify"
import { deleteItemAsync, setItemAsync } from "expo-secure-store"

const MEMORY_KEY_PREFIX = "@SecureStorage:"
let dataMemory: any = {}

export class SecureStorage {
  // set item with the key
  static setItem (key: string, value: string) {
    setItemAsync(MEMORY_KEY_PREFIX + key, value)
    dataMemory[key] = value
    return dataMemory[key]
  }

  // get item with the key
  static getItem (key: string) {
    return Object.prototype.hasOwnProperty.call(dataMemory, key)
      ? dataMemory[key]
      : undefined
  }

  // remove item with the key
  static removeItem (key: string) {
    deleteItemAsync(key)
    return delete dataMemory[key]
  }

  static clear () {
    dataMemory = {}
    return dataMemory
  }
}

Amplify.configure({
  storage: SecureStorage
})
