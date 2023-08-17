import { SecureStorage } from "@lib/SecureStorage"

const TEST_STORAGE_KEY: string = "TestStorageKey"

/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("SecureStorage tests", () => {
  test("if the secure storage manages to persist given data, through a set, then get", async () => {
    const testStorage = new SecureStorage()
    await testStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    const result = await testStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toEqual("Test Value")
    testStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can delete persisting data, and when trying to access it, no data can be found", async () => {
    const testStorage = new SecureStorage()
    await testStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    await testStorage.removeItem(TEST_STORAGE_KEY)
    const result = await testStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toBeNull()
  })
})
