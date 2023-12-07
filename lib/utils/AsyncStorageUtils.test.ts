import { AsyncStorageUtils } from "@lib/utils/AsyncStorage"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { z } from "zod"

describe("AsyncStorageUtils tests", () => {
  beforeEach(async () => await AsyncStorage.clear())

  describe("ParseJSONItems tests", () => {
    it("should resort to undefined when item is invalid json", async () => {
      await AsyncStorage.setItem("test", "uiefuiefgui")
      const items = await AsyncStorageUtils.parseJSONItems(z.string(), ["test"])
      expect(items).toEqual([["test", undefined]])
    })

    it("should resort to undefined when item does not parse with schema", async () => {
      await AsyncStorage.setItem("test", "uiefuiefgui")
      const items = await AsyncStorageUtils.parseJSONItems(z.number(), ["test"])
      expect(items).toEqual([["test", undefined]])
    })

    it("should resort to undefined when item does not exist", async () => {
      const items = await AsyncStorageUtils.parseJSONItems(z.number(), ["test"])
      expect(items).toEqual([["test", undefined]])
    })

    it("should parse items against the given schema", async () => {
      await AsyncStorage.multiSet([
        ["a", "1"],
        ["b", "2"]
      ])
      const items = await AsyncStorageUtils.parseJSONItems(z.number(), [
        "a",
        "b"
      ])
      expect(items).toEqual([
        ["a", 1],
        ["b", 2]
      ])
    })
  })
})
