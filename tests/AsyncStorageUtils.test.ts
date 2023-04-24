import { AsyncStorageUtils } from "@lib/AsyncStorage"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { z } from "zod"

describe("AsyncStorageUtils tests", () => {
  beforeEach(async () => await AsyncStorage.clear())

  describe("MultiParseItems tests", () => {
    it("should resort to the default value when item is invalid json", async () => {
      await AsyncStorage.setItem("test", "uiefuiefgui")
      const items = await AsyncStorageUtils.multiParseItems(z.string(), [
        "test"
      ])
      expect(items).toEqual([["test", undefined]])
    })

    it("should resort to the default value when item does not parse with schema", async () => {
      await AsyncStorage.setItem("test", "uiefuiefgui")
      const items = await AsyncStorageUtils.multiParseItems(z.number(), [
        "test"
      ])
      expect(items).toEqual([["test", undefined]])
    })

    it("should resort to the default value when item does not exist", async () => {
      const items = await AsyncStorageUtils.multiParseItems(z.number(), [
        "test"
      ])
      expect(items).toEqual([["test", undefined]])
    })

    it("should parse items against the given schema", async () => {
      await AsyncStorage.multiSet([
        ["a", "1"],
        ["b", "2"]
      ])
      const items = await AsyncStorageUtils.multiParseItems(z.number(), [
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
