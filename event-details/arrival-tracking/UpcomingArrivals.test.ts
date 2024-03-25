import {
  SQLiteUpcomingEventArrivals,
  requireBackgroundLocationPermissions
} from "./UpcomingArrivals"
import { mockEventArrivalRegion } from "./MockData"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"

describe("UpcomingArrivals tests", () => {
  describe("RequireBackgroundLocationPermissions tests", () => {
    resetTestSQLiteBeforeEach()
    const baseUpcomingArrivals = new SQLiteUpcomingEventArrivals(testSQLite)

    it("should not be able to query all arrivals when background location permissions are disabled", async () => {
      baseUpcomingArrivals.replaceAll([mockEventArrivalRegion()])
      const upcomingArrivals = requireBackgroundLocationPermissions(
        baseUpcomingArrivals,
        jest.fn().mockResolvedValueOnce(false)
      )
      expect(await upcomingArrivals.all()).toEqual([])
    })

    it("should not be able to save arrivals when background location permissions are disabled", async () => {
      const upcomingArrivals = requireBackgroundLocationPermissions(
        baseUpcomingArrivals,
        jest.fn().mockResolvedValueOnce(false)
      )
      await upcomingArrivals.replaceAll([mockEventArrivalRegion()])
      expect(await baseUpcomingArrivals.all()).toEqual([])
    })

    it("should work normally when background location permissions are enabled", async () => {
      const upcomingArrivals = requireBackgroundLocationPermissions(
        baseUpcomingArrivals,
        jest.fn().mockResolvedValue(true)
      )
      const arrivalRegions = [mockEventArrivalRegion()]
      await upcomingArrivals.replaceAll(arrivalRegions)
      expect(await upcomingArrivals.all()).toEqual(arrivalRegions)
      expect(await baseUpcomingArrivals.all()).toEqual(arrivalRegions)
    })
  })
})
