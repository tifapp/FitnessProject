import AsyncStorage from "@react-native-async-storage/async-storage"

export namespace AsyncStorageUtils {
  /**
   * A helper to save an object in `AsyncStorage` via stringifying.
   */
  export const save = async <T>(key: string, value: T) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }
}
