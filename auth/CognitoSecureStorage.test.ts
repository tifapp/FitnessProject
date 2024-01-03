import {
  CognitoSecureStorage,
  InMemorySecureStore
} from "@auth/CognitoSecureStorage"
import { fakeTimers } from "@test-helpers/Timers"
import { act } from "react-test-renderer"

const TEST_STORAGE_KEY = "TestStorageKey"
/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("CognitoSecureStorage tests", () => {
  const sharedStorage = new InMemorySecureStore()
  const testStorage1 = new CognitoSecureStorage(sharedStorage)
  const testStorage2 = new CognitoSecureStorage(sharedStorage)
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(async () => {
    jest.resetAllMocks()
    await testStorage1.clear()
    await testStorage2.clear()
  })
  test("if the secure storage can give correct data after a set + get", async () => {
    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(
      "Test Value"
    )
  })

  test("if the secure storage can clear all data, and when trying to access it, no data can be found", async () => {
    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    await testStorage1.setItem(TEST_STORAGE_KEY + "2", "Test Value 2")
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(
      "Test Value"
    )

    await testStorage1.clear()

    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeNull()
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "2")).toBeNull()
  })

  it("should break down large data strings into 2048 byte chunks in the underlying store", async () => {
    const data = "a".repeat(6000)
    await testStorage1.setItem(TEST_STORAGE_KEY, data)

    expect(
      await sharedStorage.getItemAsync("secureStorageTestStorageKey___chunk0")
    ).toHaveLength(2048)
    expect(
      await sharedStorage.getItemAsync("secureStorageTestStorageKey___chunk1")
    ).toHaveLength(2048)
    expect(
      await sharedStorage.getItemAsync("secureStorageTestStorageKey___chunk2")
    ).toHaveLength(1904)
  })

  it("should be able to sync large data chunks between stores", async () => {
    const data = "a".repeat(6000)
    await testStorage1.setItem(TEST_STORAGE_KEY, data)

    expect(await testStorage1.getItem(TEST_STORAGE_KEY)).toEqual(data)
    expect(await testStorage2.getItem(TEST_STORAGE_KEY)).toEqual(data)
  })

  it("should only read CognitoSecureStorage values", async () => {
    await sharedStorage.setItemAsync(
      "secureStorageTestStorage___chunk0",
      "Cool"
    )

    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(
      "Test Value"
    )
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "2")).toBeNull()
  })

  it("should load in items in both storages after a sets from testStorage1 and testStorage2, and a remove from testStorage2", async () => {
    const data = "a".repeat(6000)
    await testStorage1.setItem(TEST_STORAGE_KEY, data)

    expect(await testStorage1.getItem(TEST_STORAGE_KEY)).toEqual(data)
    expect(await testStorage2.getItem(TEST_STORAGE_KEY)).toEqual(data)

    await testStorage2.setItem(TEST_STORAGE_KEY + "1", data)

    expect(await testStorage2.getItem(TEST_STORAGE_KEY + "1")).toEqual(data)
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(data)

    await testStorage2.removeItem(TEST_STORAGE_KEY)

    expect(await testStorage2.getItem(TEST_STORAGE_KEY + "1")).toBeNull()
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeNull()
  })
})
