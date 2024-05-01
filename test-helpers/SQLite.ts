import { SQLITE_IN_MEMORY_PATH, TiFSQLite } from "@lib/SQLite"

/**
 * An in memory {@link TiFSQLite} instance for testing.
 */
export const testSQLite = new TiFSQLite(SQLITE_IN_MEMORY_PATH)

/**
 * Resets the data inside {@link testSQLite}.
 */
export const resetTestSQLiteBeforeEach = () => {
  beforeEach(async () => {
    await testSQLite.withTransaction(async (db) => {
      await db.run`DELETE FROM LocationArrivals`
      await db.run`DELETE FROM LocationPlacemarks`
      await db.run`DELETE FROM Logs`
      await db.run`DELETE FROM LocalSettings`
      await db.run`DELETE FROM UserSettings`
    })
  })
}
