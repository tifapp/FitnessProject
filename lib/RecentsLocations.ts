import { LocationCoordinate2D, TiFLocation } from "@shared-models/Location"
import { TiFSQLite } from "@lib/SQLite"
import { Placemark } from "@shared-models/Placemark"
import { DeepNullable } from "@lib/utils/DeepNullable"

/**
 * An interface for storing locations that the user has interacted with
 * previously.
 */
export interface RecentLocationsStorage {
  /**
   * Loads the `amount` most recent locations ordered by the time each location
   * was last saved.
   */
  recent(amount: number): Promise<RecentLocation[]>

  /**
   * Loads recent locations which contain matching coordinates as any of the
   * coordinates in the given array.
   */
  locationsForCoordinates(
    coordinates: LocationCoordinate2D[]
  ): Promise<RecentLocation[]>

  /**
   * Saves a location to the recents storage with the given annotation.
   */
  save(
    location: TiFLocation,
    annotation?: RecentLocationAnnotation
  ): Promise<void>
}

/**
 * {@link RecentLocationsStorage} implemented with SQLite.
 */
export class SQLiteRecentLocationsStorage implements RecentLocationsStorage {
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async recent(amount: number) {
    return await this.sqlite.withTransaction(async (db) => {
      const results = await db.queryAll<SQLiteLocationPlacemark>`
      SELECT * FROM LocationPlacemarks
      ORDER BY recentUpdatedAt DESC
      LIMIT ${amount}
      `
      return results.map(recentLocationFromSQLite)
    })
  }

  async locationsForCoordinates(coordinates: LocationCoordinate2D[]) {
    const stringifiedCoordinates = coordinates
      .map((coordinate) => `${coordinate.latitude},${coordinate.longitude}`)
      .join("|")
    return await this.sqlite.withTransaction(async (db) => {
      const results = await db.queryAll<SQLiteLocationPlacemark>`
      SELECT * FROM LocationPlacemarks
      WHERE '|' || ${stringifiedCoordinates} || '|'
        LIKE '%|' || latitude || ',' || longitude || '|%'
      ORDER BY recentUpdatedAt DESC
      `
      return results.map(recentLocationFromSQLite)
    })
  }

  async save(location: TiFLocation, annotation?: RecentLocationAnnotation) {
    await this.sqlite.withTransaction(async (db) => {
      await db.run`
      INSERT INTO LocationPlacemarks (
        latitude,
        longitude,
        name,
        country,
        postalCode,
        street,
        streetNumber,
        region,
        isoCountryCode,
        city,
        recentAnnotation
      ) VALUES (
        ${location.coordinate.latitude},
        ${location.coordinate.longitude},
        ${location.placemark.name},
        ${location.placemark.country},
        ${location.placemark.postalCode},
        ${location.placemark.street},
        ${location.placemark.streetNumber},
        ${location.placemark.region},
        ${location.placemark.isoCountryCode},
        ${location.placemark.city},
        ${annotation}
      )
      ON CONFLICT(latitude, longitude)
      DO UPDATE SET
        name = ${location.placemark.name},
        country = ${location.placemark.country},
        postalCode = ${location.placemark.postalCode},
        street = ${location.placemark.street},
        streetNumber = ${location.placemark.streetNumber},
        isoCountryCode = ${location.placemark.isoCountryCode},
        city = ${location.placemark.city},
        recentAnnotation = ${annotation},
        recentUpdatedAt = unixepoch('now', 'subsec')
      `
    })
  }
}

type SQLiteLocationPlacemark = LocationCoordinate2D &
  DeepNullable<Required<Placemark>> & {
    recentAnnotation: RecentLocationAnnotation | null
  }

const recentLocationFromSQLite = (location: SQLiteLocationPlacemark) => ({
  location: {
    coordinate: {
      latitude: location.latitude,
      longitude: location.longitude
    },
    placemark: {
      name: location.name ?? undefined,
      country: location.country ?? undefined,
      postalCode: location.postalCode ?? undefined,
      street: location.street ?? undefined,
      streetNumber: location.streetNumber ?? undefined,
      region: location.region ?? undefined,
      isoCountryCode: location.isoCountryCode ?? undefined,
      city: location.city ?? undefined
    }
  },
  annotation: location.recentAnnotation ?? undefined
})

/**
 * Reason for saving a location in the location storage.
 *
 * This is mainly meant for use cases in which some status indicator can
 * be shown on top of a history item, indicating some context to the
 * user about the result (eg. `"You recently hosted 3 events here"`).
 *
 * ### Available Options
 * - `"attended-event"`
 *    - Use this when the user has evidence of attending an event.
 * - `"hosted-event"`
 *    - Use this when the user creates an event.
 * - `"joined-event"`
 *    - Use this when the user has joined an event.
 */
export type RecentLocationAnnotation =
  | "attended-event"
  | "hosted-event"
  | "joined-event"

/**
 * A type that contains recency data around a particular location.
 */
export type RecentLocation = {
  location: TiFLocation
  annotation?: RecentLocationAnnotation
}
