import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_INTERNAL_METRICS_VALUES,
  SQLiteInternalMetrics
} from "./InternalMetrics"

describe("InternalMetrics tests", () => {
  describe("SQLiteInternalMetrics tests", () => {
    resetTestSQLiteBeforeEach()
    const internalMetrics = new SQLiteInternalMetrics(testSQLite)

    it("should return the default values when no values are saved", async () => {
      const values = await internalMetrics.current()
      expect(values).toEqual(DEFAULT_INTERNAL_METRICS_VALUES)
    })

    test("save once, then load, returns updated values", async () => {
      await internalMetrics.update({
        hasCompletedOnboarding: true,
        lastEventArrivalsRefreshDate: new Date(1000)
      })
      const values = await internalMetrics.current()
      expect(values).toEqual({
        ...DEFAULT_INTERNAL_METRICS_VALUES,
        hasCompletedOnboarding: true,
        lastEventArrivalsRefreshDate: new Date(1000)
      })
    })

    test("save value as undefined, then load, ignored in updated values", async () => {
      await internalMetrics.update({
        hasCompletedOnboarding: true,
        lastEventArrivalsRefreshDate: undefined
      })
      const values = await internalMetrics.current()
      expect(values).toEqual({
        ...DEFAULT_INTERNAL_METRICS_VALUES,
        hasCompletedOnboarding: true
      })
    })

    test("save twice, then load, returns updated values", async () => {
      await internalMetrics.update({
        hasCompletedOnboarding: true
      })
      await internalMetrics.update({
        lastEventArrivalsRefreshDate: new Date(1000)
      })
      const values = await internalMetrics.current()
      expect(values).toEqual({
        ...DEFAULT_INTERNAL_METRICS_VALUES,
        hasCompletedOnboarding: true,
        lastEventArrivalsRefreshDate: new Date(1000)
      })
    })

    test("save twice, only creates 1 row in the InternalMetrics table", async () => {
      await internalMetrics.update({
        hasCompletedOnboarding: true
      })
      await internalMetrics.update({
        lastEventArrivalsRefreshDate: new Date(1000)
      })
      const count = (await testSQLite.withTransaction(async (db) => {
        return await db.queryFirst<{
          c: number
        }>`SELECT COUNT(*) as c FROM InternalMetrics`
      }))!.c
      expect(count).toEqual(1)
    })
  })
})
