import { EventArrivalRegion } from "@shared-models/EventArrivals"
import { getBackgroundPermissionsAsync } from "expo-location"
import { TiFSQLite } from "@lib/SQLite"
import { LocationCoordinate2D } from "@shared-models/Location"
import { areEventRegionsEqual } from "TiFShared/domain-models/Event"

/**
 * An interface for storing client-side details on upcoming event arrivals.
 */
export interface UpcomingEventArrivals {
  /**
   * Loads all upcoming event arrivals.
   */
  all: () => Promise<EventArrivalRegion[]>

  /**
   * Replaces all upcoming arrivals with the new list of arrivals.
   */
  replaceAll: (regions: EventArrivalRegion[]) => Promise<void>
}

/**
 * {@link UpcomingEventArrivals} implemented with SQLite.
 */
export class SQLiteUpcomingEventArrivals implements UpcomingEventArrivals {
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async all() {
    return await this.sqlite.withTransaction(async (db) => {
      const results = await db.queryAll<
        LocationCoordinate2D & {
          arrivalRadiusMeters: number
          eventId: number
          hasArrived: number
        }
      >`
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
      return results.reduce((acc, curr) => {
        const region = {
          coordinate: {
            latitude: curr.latitude,
            longitude: curr.longitude
          },
          arrivalRadiusMeters: curr.arrivalRadiusMeters,
          isArrived: curr.hasArrived === 1
        }
        if (
          acc.length > 0 &&
          areEventRegionsEqual(acc[acc.length - 1], region)
        ) {
          acc[acc.length - 1].eventIds.push(curr.eventId)
        } else {
          acc.push({ eventIds: [curr.eventId], ...region })
        }
        return acc
      }, [] as EventArrivalRegion[])
    })
  }

  async replaceAll(regions: EventArrivalRegion[]) {
    await this.sqlite.withTransaction(async (db) => {
      await db.run`DELETE FROM LocationArrivals`
      await Promise.all(
        regions.map(async (region) => {
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
            ${region.isArrived}
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
}

/**
 * Given a base {@link UpcomingEventArrivals} instance, it prevents arrivals
 * from being read and written if the user has background location permissions
 * disabled.
 */
export const requireBackgroundLocationPermissions = (
  base: UpcomingEventArrivals,
  loadPermissions: () => Promise<boolean> = async () => {
    return (await getBackgroundPermissionsAsync()).granted
  }
): UpcomingEventArrivals => ({
  all: async () => {
    return (await loadPermissions()) ? await base.all() : []
  },
  replaceAll: async (arrivalRegions) => {
    if (await loadPermissions()) {
      await base.replaceAll(arrivalRegions)
    }
  }
})
