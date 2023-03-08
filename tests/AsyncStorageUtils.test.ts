import { AsyncStorageUtils } from "@lib/AsyncStorage"
import AsyncStorage from "@react-native-async-storage/async-storage"

const testKey = "test_key"
const testObject = {
  hello: "world",
  num: 1,
  bool: true,
  nested: { hello: "world" }
}

describe("AsyncStorageUtils tests", () => {
  test("saving object for key", async () => {
    await AsyncStorageUtils.save(testKey, testObject)
    const result = await AsyncStorage.getItem(testKey)
    expect(JSON.parse(result!!)).toMatchObject(testObject)
  })

  test("getting object for key", async () => {
    await AsyncStorage.setItem(testKey, JSON.stringify(testObject))
    expect(await AsyncStorageUtils.load(testKey)).toEqual(testObject)
  })
})
