import { AmplifySecureStorage } from "@lib/SecureStorage"
import { TestSecureStorage } from "./helpers/SecureStorage"

const TEST_STORAGE_KEY: string = "@TestStorageKey: "

/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("SecureStorage tests", () => {
  test("if the secure storage can sync data between another instance, after a get, set, and remove", async () => {
    const sharedStorage = new TestSecureStorage()
    const TestStorage1 = new AmplifySecureStorage(sharedStorage)
    const TestStorage2 = new AmplifySecureStorage(sharedStorage)

    //Test set + get
    TestStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    TestStorage1.setItem(TEST_STORAGE_KEY + "2", "Test Value 2")
    TestStorage1.setItem(TEST_STORAGE_KEY + "3", "Test Value 3")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual("Test Value")

    //Test remove
    TestStorage1.removeItem(TEST_STORAGE_KEY + "1")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeUndefined()

    //Test sync
    expect(TestStorage2.getItem(TEST_STORAGE_KEY + "2")).toBeUndefined()
    await TestStorage2.sync()
    expect(TestStorage2.getItem(TEST_STORAGE_KEY + "2")).toEqual("Test Value 2")
  })
  test("if the secure storage can clear all data, and when trying to access it, no data can be found", async () => {
    const sharedStorage = new TestSecureStorage()
    const TestStorage1 = new AmplifySecureStorage(sharedStorage)

    TestStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    TestStorage1.setItem(TEST_STORAGE_KEY + "2", "Test Value 2")
    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual("Test Value")

    await TestStorage1.clear()

    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeUndefined()

    expect(TestStorage1.getItem(TEST_STORAGE_KEY + "2")).toBeUndefined()
  })
})
