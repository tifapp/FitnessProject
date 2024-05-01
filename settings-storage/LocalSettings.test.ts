import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_LOCAL_SETTINGS,
  SQLiteLocalSettingsStorage
} from "./LocalSettings"

describe("LocalSettings tests", () => {
  describe("SQLiteLocalSettingsStorage tests", () => {
    resetTestSQLiteBeforeEach()
    const storage = new SQLiteLocalSettingsStorage(testSQLite)

    it("should return the default settings when calling load with no changes", async () => {
      const settings = await storage.load()
      expect(settings).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should return the updated settings when calling load with changes", async () => {
      await storage.save({ hasCompletedOnboarding: true })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        hasCompletedOnboarding: true
      })
    })

    it("should merge changes when saving", async () => {
      await storage.save({ hasCompletedOnboarding: true })
      await storage.save({ isHapticAudioEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        hasCompletedOnboarding: true,
        isHapticAudioEnabled: false
      })
    })
  })
})
