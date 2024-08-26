import {
  SQLiteEventArrivalsStorage,
  requireBackgroundLocationPermissions
} from "./Storage"
import { mockEventArrivalRegion } from "./MockData"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { EventArrivals } from "./Arrivals"
import { expectOrderInsensitiveEventArrivals } from "./TestHelpers"

describe("UpcomingArrivals tests", () => {
  describe("RequireBackgroundLocationPermissions tests", () => {
    resetTestSQLiteBeforeEach()
    const baseStorage = new SQLiteEventArrivalsStorage(testSQLite)

    it("should not be able to query all arrivals when background location permissions are disabled", async () => {
      baseStorage.replace(EventArrivals.fromRegions([mockEventArrivalRegion()]))
      const storage = requireBackgroundLocationPermissions(
        baseStorage,
        jest.fn().mockResolvedValueOnce(false)
      )
      expect(await storage.current()).toEqual(new EventArrivals())
    })

    it("should not be able to save arrivals when background location permissions are disabled", async () => {
      const storage = requireBackgroundLocationPermissions(
        baseStorage,
        jest.fn().mockResolvedValueOnce(false)
      )
      await storage.replace(
        EventArrivals.fromRegions([mockEventArrivalRegion()])
      )
      expect(await baseStorage.current()).toEqual(new EventArrivals())
    })

    it("should work normally when background location permissions are enabled", async () => {
      const storage = requireBackgroundLocationPermissions(
        baseStorage,
        jest.fn().mockResolvedValue(true)
      )
      const arrivals = EventArrivals.fromRegions([mockEventArrivalRegion()])
      await storage.replace(arrivals)
      expectOrderInsensitiveEventArrivals(await storage.current(), arrivals)
      expectOrderInsensitiveEventArrivals(await baseStorage.current(), arrivals)
    })

    it("should use base storage for detecting arrival when permissions are enabled", async () => {
      const storage = requireBackgroundLocationPermissions(
        baseStorage,
        jest.fn().mockResolvedValue(true)
      )
      const region = { ...mockEventArrivalRegion(), hasArrived: true }
      const arrivals = EventArrivals.fromRegions([region])
      await storage.replace(arrivals)
      expect(await storage.hasArrivedAt(region)).toEqual(true)
    })

    it("should return false for detecting arrival when permissions are disabled", async () => {
      const storage = requireBackgroundLocationPermissions(
        baseStorage,
        jest.fn().mockResolvedValue(false)
      )
      const region = { ...mockEventArrivalRegion(), hasArrived: true }
      const arrivals = EventArrivals.fromRegions([region])
      await storage.replace(arrivals)
      expect(await storage.hasArrivedAt(region)).toEqual(false)
    })
  })
})
