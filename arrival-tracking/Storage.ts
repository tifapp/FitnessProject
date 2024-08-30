import { getBackgroundPermissionsAsync } from "expo-location"
import { TiFSQLite } from "@lib/SQLite"
import { EventArrivalRegion, EventID } from "TiFShared/domain-models/Event"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { EventArrivals } from "./Arrivals"

/**
 * An interface for storing client-side details on upcoming event arrivals.
 */
export interface EventArrivalsStorage {
  /**
   * Loads all stored event arrivals.
   */
  current: () => Promise<EventArrivals>

  /**
   * Replaces all stored arrivals with a new instance of {@link EventArrivals}.
   */
  replace: (regions: EventArrivals) => Promise<void>

  /**
   * Returns true if the user has arrived at the specified {@link EventArrivalRegion}.
   *
   * @param region An {@link EventArrivalRegion}.
   * @returns true if the user has arrived `region`.
   */
  hasArrivedAt: (
    region: Pick<EventArrivalRegion, "coordinate" | "arrivalRadiusMeters">
  ) => Promise<boolean | undefined>
}

/**
 * {@link EventArrivalsStorage} implemented with SQLite.
 */
export class SQLiteEventArrivalsStorage implements EventArrivalsStorage {
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async current() {
    return await this.sqlite.withTransaction(async (db) => {
      const arrivals = (
        await db.queryAll<SQLiteEventArrival>`
      SELECT
        l.*,
        u.eventId AS eventId
      FROM UpcomingEventArrivals u
      LEFT JOIN LocationArrivals l ON
        u.latitude = l.latitude AND
        u.longitude = l.longitude AND
        u.arrivalRadiusMeters = l.arrivalRadiusMeters
      ORDER BY
        u.latitude DESC,
        u.longitude DESC,
        u.arrivalRadiusMeters DESC
      `
      ).map((arrival) => ({
        eventId: arrival.eventId,
        coordinate: {
          latitude: arrival.latitude,
          longitude: arrival.longitude
        },
        arrivalRadiusMeters: arrival.arrivalRadiusMeters,
        hasArrived: arrival.hasArrived === 1
      }))
      return new EventArrivals(arrivals)
    })
  }

  async replace(arrivals: EventArrivals) {
    await this.sqlite.withTransaction(async (db) => {
      await db.run`DELETE FROM LocationArrivals`
      await db.run`DELETE FROM UpcomingEventArrivals`
      await Promise.all(
        arrivals.regions.map(async (region) => {
          await db.run`
          INSERT INTO LocationArrivals (
            latitude,
            longitude,
            arrivalRadiusMeters,
            hasArrived
          ) VALUES (
            ${region.coordinate.latitude},
            ${region.coordinate.longitude},
            ${region.arrivalRadiusMeters},
            ${region.hasArrived}
          )
          `
          await Promise.all(
            region.eventIds.map(async (eventId) => {
              await db.run`
              INSERT INTO UpcomingEventArrivals (
                eventId,
                latitude,
                longitude,
                arrivalRadiusMeters
              ) VALUES (
                ${eventId},
                ${region.coordinate.latitude},
                ${region.coordinate.longitude},
                ${region.arrivalRadiusMeters}
              )`
            })
          )
        })
      )
    })
  }

  async hasArrivedAt(
    region: Pick<EventArrivalRegion, "coordinate" | "arrivalRadiusMeters">
  ) {
    return await this.sqlite.withTransaction(async (db) => {
      const value = await db.queryFirst<{ hasArrived: number }>`
        SELECT hasArrived FROM LocationArrivals
        WHERE
          latitude = ${region.coordinate.latitude} AND
          longitude = ${region.coordinate.longitude} AND
          arrivalRadiusMeters = ${region.arrivalRadiusMeters}
      `
      if (!value) return undefined
      return value.hasArrived === 1
    })
  }
}

type SQLiteEventArrival = LocationCoordinate2D & {
  arrivalRadiusMeters: number
  eventId: EventID
  hasArrived: number
}

/**
 * Given a base {@link EventArrivalsStorage} instance, it prevents arrivals
 * from being read and written if the user has background location permissions
 * disabled.
 */
export const requireBackgroundLocationPermissions = (
  base: EventArrivalsStorage,
  loadPermissions: () => Promise<boolean> = async () => {
    return (await getBackgroundPermissionsAsync()).granted
  }
): EventArrivalsStorage => ({
  current: async () => {
    return (await loadPermissions())
      ? await base.current()
      : new EventArrivals()
  },
  replace: async (arrivalRegions) => {
    if (await loadPermissions()) {
      await base.replace(arrivalRegions)
    }
  },
  hasArrivedAt: async (region) => {
    return (await loadPermissions()) && (await base.hasArrivedAt(region))
  }
})
