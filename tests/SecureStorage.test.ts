import { TestSecureStorage } from "./helpers/SecureStorage"

const TEST_STORAGE_KEY: string = "@TestStorageKey:"

/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("SecureStorage tests", () => {
  test("if the secure storage can sync data between another instance, after a get, set, and remove", async () => {
    TestSecureStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    const result = TestSecureStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toEqual("Test Value")
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can clear all data, and when trying to access it, no data can be found", async () => {
    TestSecureStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
    const result = TestSecureStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toBeUndefined()
    TestSecureStorage.removeItem(TEST_STORAGE_KEY)
  })
})
