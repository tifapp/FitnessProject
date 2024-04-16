import { SQLExecutable, TiFSQLite } from "@lib/SQLite"
import { mergeWithPartial } from "TiFShared/lib/Object"

/**
 * A type for modeling simple configuration values that the app needs to keep
 * track of over time, are not directly shown/are directly configurable by the
 * user in the through any direct means, but do effect the user experience.
 *
 * For example, when `hasCompletedOnboarding` is false, then we need to
 * display the onboarding experience, and afterwards we set it to true.
 * However, the user doesn't do this directly through a settings page, instead
 * we do it indirectly after they have completed onboarding.
 */
export type InternalMetrics = {
  hasCompletedOnboarding: boolean
  lastEventArrivalsRefreshDate: Date | null
}

export const DEFAULT_INTERNAL_METRICS_VALUES = {
  hasCompletedOnboarding: false,
  lastEventArrivalsRefreshDate: null
} as Readonly<InternalMetrics>

/**
 * An interface for storing the current {@link InternalMetrics}.
 */
export interface InternalMetricsStorage {
  /**
   * Returns the current {@link InternalMetrics} or
   * {@link DEFAULT_INTERNAL_METRICS_VALUES} if none exist.
   */
  current(): Promise<InternalMetrics>

  /**
   * Updates the current {@link InternalMetrics} based on the partial
   * `values` given.
   *
   * @param values A partial object of values to update.
   */
  update(values: Partial<InternalMetrics>): Promise<void>
}

type SQLiteInternalMetrics = {
  hasCompletedOnboarding: number
  lastEventArrivalsRefreshTime: number | null
}

/**
 * {@link InternalMetricsStorage} implementation using SQLite.
 */
export class SQLiteInternalMetricsStorage implements InternalMetricsStorage {
  private readonly sqlite: TiFSQLite

  constructor(sqlite: TiFSQLite) {
    this.sqlite = sqlite
  }

  async current() {
    return await this.sqlite.withTransaction(this.currentValues)
  }

  async update(values: Partial<InternalMetrics>) {
    await this.sqlite.withTransaction(async (db) => {
      const valuesToSave = mergeWithPartial(
        await this.currentValues(db),
        values
      )
      await db.run`
      INSERT INTO InternalMetrics (
        hasCompletedOnboarding,
        lastEventArrivalsRefreshTime
      ) VALUES (
        ${valuesToSave.hasCompletedOnboarding},
        ${valuesToSave.lastEventArrivalsRefreshDate?.getTime()}
      )
      ON CONFLICT(id)
      DO UPDATE SET
        hasCompletedOnboarding = ${valuesToSave.hasCompletedOnboarding},
        lastEventArrivalsRefreshTime = ${valuesToSave.lastEventArrivalsRefreshDate?.getTime()}
      `
    })
  }

  private async currentValues(db: SQLExecutable) {
    const dbValues = await db.queryFirst<SQLiteInternalMetrics>`
      SELECT * FROM InternalMetrics LIMIT 1
      `
    if (!dbValues) return { ...DEFAULT_INTERNAL_METRICS_VALUES }
    return {
      hasCompletedOnboarding: dbValues.hasCompletedOnboarding === 1,
      lastEventArrivalsRefreshDate: dbValues.lastEventArrivalsRefreshTime
        ? new Date(dbValues.lastEventArrivalsRefreshTime)
        : null
    }
  }
}
