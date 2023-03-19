import AsyncStorage from "@react-native-async-storage/async-storage"

export namespace AsyncStorageUtils {
  /**
   * A helper to save an object in `AsyncStorage` via `JSON.stringify`.
   */
  export const save = async <T>(key: string, value: T) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }

  /**
   * A helper to load an object from `AsyncStorage` via `JSON.parse`.
   */
  export const load = async <T>(key: string) => {
    const value = await AsyncStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  }
}
