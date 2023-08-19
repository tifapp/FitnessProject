import { TestSecureStorage } from "./helpers/SecureStorage"

const TEST_STORAGE_KEY: string = "TestStorageKey"

/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("SecureStorage tests", () => {
  test("if the secure storage manages to persist given data, through a set, then get", async () => {
    const testStorage = new TestSecureStorage()
    await testStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    const result = await testStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toEqual("Test Value")
    testStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can delete persisting data, and when trying to access it, no data can be found", async () => {
    const testStorage = new TestSecureStorage()
    await testStorage.setItem(TEST_STORAGE_KEY, "Test Value")
    await testStorage.removeItem(TEST_STORAGE_KEY)
    const result = await testStorage.getItem(TEST_STORAGE_KEY)
    expect(result).toBeNull()
    testStorage.removeItem(TEST_STORAGE_KEY)
  })
  test("if the secure storage can place multiple keys/values successfully, clear, and the information does get removed", async () => {
    const testStorage = new TestSecureStorage()

    await testStorage.setItem(TEST_STORAGE_KEY + "0", "Test Value")
    await testStorage.setItem(TEST_STORAGE_KEY + "1", "Test Value 2")
    const initialTest = await testStorage.getItem(TEST_STORAGE_KEY + "1")
    expect(initialTest).toEqual("Test Value 2")

    await testStorage.setItem(TEST_STORAGE_KEY + "2", "Test Value")
    await testStorage.setItem(TEST_STORAGE_KEY + "3", "Test Value")

    testStorage.clear()
    const result = await testStorage.getItem(TEST_STORAGE_KEY + "2")
    expect(result).toBeNull()
  })
})
