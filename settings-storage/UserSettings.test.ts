import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { SQLiteUserSettingsStorage } from "./UserSettings"
import { DEFAULT_USER_SETTINGS } from "TiFShared/domain-models/User"

describe("UserSettings tests", () => {
  describe("SQLiteUserSettingsStorage tests", () => {
    resetTestSQLiteBeforeEach()
    const storage = new SQLiteUserSettingsStorage(testSQLite)

    it("should return the default settings when calling load with no changes", async () => {
      const settings = await storage.load()
      expect(settings).toEqual(DEFAULT_USER_SETTINGS)
    })

    it("should return the updated settings when calling load with changes", async () => {
      await storage.save({ isAnalyticsEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false
      })
    })

    it("should merge changes when saving", async () => {
      await storage.save({ canShareArrivalStatus: false })
      await storage.save({ isCrashReportingEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_USER_SETTINGS,
        canShareArrivalStatus: false,
        isCrashReportingEnabled: false
      })
    })
  })
})
