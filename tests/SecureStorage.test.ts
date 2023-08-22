import { TestSecureStorage } from "./helpers/SecureStorage"

const TEST_STORAGE_KEY: string = "TestStorageKey"

/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("SecureStorage tests", () => {
  test("if the secure storage manages to persist given data, through a set, then get", async () => {
    TestSecureStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    const result = TestSecureStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toEqual("Test Value")
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can delete persisting data, and when trying to access it, no data can be found", async () => {
    TestSecureStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
    const result = TestSecureStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toBeUndefined()
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can place multiple keys/values successfully, and successfully clear all data", async () => {
    TestSecureStorage.setItem(TEST_STORAGE_KEY + "0", "Test Value")
    TestSecureStorage.setItem(TEST_STORAGE_KEY + "1", "Test Value 2")
    const initialTest = TestSecureStorage.getItem(TEST_STORAGE_KEY + "1")
    expect(initialTest).toEqual("Test Value 2")

    TestSecureStorage.setItem(TEST_STORAGE_KEY + "2", "Test Value")
    TestSecureStorage.setItem(TEST_STORAGE_KEY + "3", "Test Value")

    TestSecureStorage.clear()
    const result = TestSecureStorage.getItem(TEST_STORAGE_KEY + "2")
    expect(result).toBeUndefined()
  })
})
