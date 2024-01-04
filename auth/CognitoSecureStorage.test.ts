import { CognitoSecureStorage } from "@auth/CognitoSecureStorage"
import { InMemorySecureStore } from "@test-helpers/InMemorySecureStore"
import { fakeTimers } from "@test-helpers/Timers"
import { act } from "react-test-renderer"

const TEST_STORAGE_KEY = "TestStorageKey"
/**
 * Have to mock this instead of attempting to utilise the functionality directly
 */
describe("CognitoSecureStorage tests", () => {
  const testInMemorySecureStore = new InMemorySecureStore()
  const testStorage1 = new CognitoSecureStorage(testInMemorySecureStore)

  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(async () => {
    await testStorage1.clear()
    testInMemorySecureStore.clear()
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

  it("should remove an item from the testStorage correctly", async () => {
    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(
      "Test Value"
    )

    await testStorage1.removeItem(TEST_STORAGE_KEY + "1")

    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeNull()
  })

  it("should only clear CognitoSecureStorage values", async () => {
    await testInMemorySecureStore.setItemAsync(
      "secureStorageTestStorageKey2___chunk0",
      "Cool"
    )

    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")

    await testStorage1.clear()

    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toBeNull()
    expect(
      await testInMemorySecureStore.getItemAsync(
        "secureStorageTestStorageKey2___chunk0"
      )
    ).toEqual("Cool")
  })

  it("should break down large data strings into 2048 byte chunks in the underlying store", async () => {
    const data = "a".repeat(6000)
    await testStorage1.setItem(TEST_STORAGE_KEY, data)

    expect(
      await testInMemorySecureStore.getItemAsync(
        "secureStorageTestStorageKey___chunk0"
      )
    ).toHaveLength(2048)
    expect(
      await testInMemorySecureStore.getItemAsync(
        "secureStorageTestStorageKey___chunk1"
      )
    ).toHaveLength(2048)
    expect(
      await testInMemorySecureStore.getItemAsync(
        "secureStorageTestStorageKey___chunk2"
      )
    ).toHaveLength(1904)
  })

  it("should be able to sync large data chunks between stores", async () => {
    const testStorage2 = new CognitoSecureStorage(testInMemorySecureStore)
    const data = "a".repeat(6000)
    await testStorage1.setItem(TEST_STORAGE_KEY, data)

    expect(await testStorage1.getItem(TEST_STORAGE_KEY)).toEqual(data)
    expect(await testStorage2.getItem(TEST_STORAGE_KEY)).toEqual(data)
  })

  it("should only read CognitoSecureStorage values", async () => {
    await testInMemorySecureStore.setItemAsync(
      "secureStorageTestStorageKey2___chunk0",
      "Cool"
    )

    await testStorage1.setItem(TEST_STORAGE_KEY + "1", "Test Value")
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "1")).toEqual(
      "Test Value"
    )
    expect(await testStorage1.getItem(TEST_STORAGE_KEY + "2")).toBeNull()
  })
})
