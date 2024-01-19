import AsyncStorage from "@react-native-async-storage/async-storage"

export const clearAsyncStorageBeforeEach = () => {
  beforeEach(async () => await AsyncStorage.clear())
}
