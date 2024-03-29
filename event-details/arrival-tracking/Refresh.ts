import { AsyncStorageUtils } from "@lib/utils/AsyncStorage"
import { StringDateSchema, addSecondsToDate, diffDates, now } from "@date-time"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AppState } from "react-native"
import { EventArrivalsTracker } from "./Tracker"
import { TiFAPI } from "@api-client/TiFAPI"

/**
 * A class that manages the storage of the last event arrivals refresh date.
 */
export class EventArrivalsLastRefreshDate {
  private static LAST_REFRESH_KEY = "@event-arrivals-last-refresh"
  private cachedRefreshDate?: Date

  /**
   * Returns the current last refresh date.
   */
  async date () {
    if (this.cachedRefreshDate) return this.cachedRefreshDate
    const lastDate = await AsyncStorageUtils.parseJSONItem(
      StringDateSchema,
      EventArrivalsLastRefreshDate.LAST_REFRESH_KEY
    )
    this.cachedRefreshDate = lastDate
    return lastDate
  }

  /**
   * Marks the new last refresh date as the current date.
   */
  async markNewRefreshDate () {
    const lastDate = new Date()
    this.cachedRefreshDate = lastDate
    await AsyncStorage.setItem(
      EventArrivalsLastRefreshDate.LAST_REFRESH_KEY,
      JSON.stringify(lastDate)
    )
  }
}

/**
 * A class that manages refreshing of upcoming event arrivals.
 */
export class EventArrivalsRefresher {
  private readonly performRefresh: () => Promise<void>
  private readonly lastRefreshDate: EventArrivalsLastRefreshDate
  private readonly minutesBetweenNeededRefreshes: number

  private get secondsNeededBetweenRefreshes () {
    return this.minutesBetweenNeededRefreshes * 60
  }

  constructor (
    performRefresh: () => Promise<void>,
    lastRefreshDate: EventArrivalsLastRefreshDate,
    minutesBetweenNeededRefreshes: number
  ) {
    this.performRefresh = performRefresh
    this.lastRefreshDate = lastRefreshDate
    this.minutesBetweenNeededRefreshes = minutesBetweenNeededRefreshes
  }

  static usingTracker (
    tracker: EventArrivalsTracker,
    tifAPI: TiFAPI,
    lastRefreshDate: EventArrivalsLastRefreshDate,
    minutesBetweenNeededRefreshes: number
  ) {
    return new EventArrivalsRefresher(
      async () => {
        await tracker.refreshArrivals(async () => {
          const resp = await tifAPI.upcomingEventArrivalRegions()
          return resp.data.upcomingRegions
        })
      },
      lastRefreshDate,
      minutesBetweenNeededRefreshes
    )
  }

  /**
   * Refreshes if the time from the last refresh is greater than the specified duration of minutes.
   */
  async refreshIfNeeded () {
    if (now().isSameOrAfter(await this.nextAvailableRefreshDate())) {
      await this.forceRefresh()
    }
  }

  /**
   * Returns the number of milliseconds to wait until another refresh should be performed.
   */
  async timeUntilNextRefreshAvailable () {
    const { milliseconds } = diffDates(
      await this.nextAvailableRefreshDate(),
      new Date()
    )
    return Math.max(0, milliseconds)
  }

  /**
   * Forces a refresh and updates the last referesh time.
   */
  async forceRefresh () {
    await Promise.allSettled([
      this.performRefresh(),
      this.lastRefreshDate.markNewRefreshDate()
    ])
  }

  private async nextAvailableRefreshDate () {
    const lastDate = await this.lastRefreshDate.date()
    if (!lastDate) return new Date()
    return addSecondsToDate(lastDate, this.secondsNeededBetweenRefreshes)
  }
}

/**
 * Sets up forced interval refreshing and needed refreshes whenever the app foregrounds.
 */
export const setupArrivalsRefreshPolicy = (
  refresher: EventArrivalsRefresher
) => {
  AppState.addEventListener("change", async (state) => {
    if (state === "active") {
      await refresher.refreshIfNeeded()
    }
  })
  setupIntervalRefreshes(refresher)
}

const setupIntervalRefreshes = async (refresher: EventArrivalsRefresher) => {
  setTimeout(async () => {
    // NB: We force refresh because setTimeout delays are imprecise and thus can possibly
    // cause missed refreshes. However, this is fine since we sleep for "about the right"
    // amount of time needed to make the refreshes available.
    await refresher.forceRefresh()

    // NB: See https://developer.mozilla.org/en-US/docs/Web/API/setInterval#ensure_that_execution_duration_is_shorter_than_interval_frequency
    await setupIntervalRefreshes(refresher)
  }, await refresher.timeUntilNextRefreshAvailable())
}
