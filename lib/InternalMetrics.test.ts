import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_INTERNAL_METRICS_VALUES,
  SQLiteInternalMetricsStorage
} from "./InternalMetrics"

describe("InternalMetrics tests", () => {
  describe("SQLiteInternalMetrics tests", () => {
    resetTestSQLiteBeforeEach()
    const internalMetrics = new SQLiteInternalMetricsStorage(testSQLite)

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
  })
})
