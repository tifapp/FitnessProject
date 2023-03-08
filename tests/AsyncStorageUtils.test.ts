import { AsyncStorageUtils } from "@lib/AsyncStorage"
import AsyncStorage from "@react-native-async-storage/async-storage"

describe("AsyncStorageUtils tests", () => {
  test("saving object for key", async () => {
    const savedObject = {
      hello: "world",
      num: 1,
      bool: true,
      nested: { hello: "world" }
    }
    const key = "test_key"
    await AsyncStorageUtils.save(key, savedObject)
    const result = await AsyncStorage.getItem(key)
    expect(JSON.parse(result!!)).toMatchObject(savedObject)
  })
})
