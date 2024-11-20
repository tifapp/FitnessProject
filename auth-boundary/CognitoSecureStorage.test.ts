import { InMemorySecureStore } from "@lib/SecureStore"
import { CognitoSecureStorage } from "./CognitoSecureStorage"

const TEST_STORAGE_KEY = "TestStorageKey"
/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("CognitoSecureStorage tests", () => {
  test("if the secure storage can sync data between another instance, after a get, set, and remove", async () => {
    const sharedStorage = new InMemorySecureStore()
    const TestStorage1 = new CognitoSecureStorage(sharedStorage)
    const TestStorage2 = new CognitoSecureStorage(sharedStorage)

    // Test set + get
    TestStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    TestStorage1.setItem(TEST_STORAGE_KEY + "2", "Test Value 2")
    TestStorage1.setItem(TEST_STORAGE_KEY + "3", "Test Value 3")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual("Test Value")

    // Test remove
    TestStorage1.removeItem(TEST_STORAGE_KEY + "1")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeUndefined()

    // Test sync
    expect(TestStorage2.getItem(TEST_STORAGE_KEY + "2")).toBeUndefined()
    await TestStorage2.sync()
    expect(TestStorage2.getItem(TEST_STORAGE_KEY + "2")).toEqual("Test Value 2")
  })

  test("if the secure storage can clear all data, and when trying to access it, no data can be found", async () => {
    const sharedStorage = new InMemorySecureStore()
    const TestStorage1 = new CognitoSecureStorage(sharedStorage)

    TestStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    TestStorage1.setItem(TEST_STORAGE_KEY + "2", "Test Value 2")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual("Test Value")

    await TestStorage1.clear()

    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeUndefined()

    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "2")).toBeUndefined()
  })

  it("should break down large data strings into 2048 byte chunks in the underlying store", async () => {
    const testStore = new InMemorySecureStore()
    const storage = new CognitoSecureStorage(testStore)

    const data = "a".repeat(6000)
    storage.setItem(TEST_STORAGE_KEY, data)

    expect(
      await testStore.getItemAsync("secureStorageTestStorageKey___chunk0")
    ).toHaveLength(2048)
    expect(
      await testStore.getItemAsync("secureStorageTestStorageKey___chunk1")
    ).toHaveLength(2048)
    expect(
      await testStore.getItemAsync("secureStorageTestStorageKey___chunk2")
    ).toHaveLength(1904)
  })

  it("should be able to sync large data chunks between stores", async () => {
    const testStore = new InMemorySecureStore()
    const storage1 = new CognitoSecureStorage(testStore)
    const storage2 = new CognitoSecureStorage(testStore)

    const data = "a".repeat(6000)
    storage1.setItem(TEST_STORAGE_KEY, data)

    await storage2.sync()

    expect(storage2.getItem(TEST_STORAGE_KEY)).toEqual(data)
  })
})
