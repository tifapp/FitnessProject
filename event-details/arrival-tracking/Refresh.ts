import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { StringDateSchema, diffDates } from "@lib/date"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AppState } from "react-native"
import { EventArrivalNotification } from "./models"
import { EventArrivalsTracker } from "./Tracker"

/**
 * A class that manages refreshing of upcoming event arrivals.
 */
export class EventArrivalsRefresher {
  private readonly lastRefreshTime = new LastRefreshTime()
  private readonly performRefresh: () => Promise<void>
  private readonly minutesBetweenNeededRefreshes: number

  constructor (
    performRefresh: () => Promise<void>,
    minutesBetweenNeededRefreshes: number
  ) {
    this.performRefresh = performRefresh
    this.minutesBetweenNeededRefreshes = minutesBetweenNeededRefreshes
  }

  static usingTracker (
    tracker: EventArrivalsTracker,
    fetchUpcomingNotifications: () => Promise<EventArrivalNotification[]>
  ) {
    return new EventArrivalsRefresher(async () => {
      await tracker.refreshUpcomingArrivalNotifications(
        fetchUpcomingNotifications
      )
    }, 30)
  }

  /**
   * Refreshes if the time from the last refresh is greater than the specified duration of minutes.
   */
  async refreshIfNeeded () {
    const refreshTimeDiff = await this.lastRefreshTime.diffFromLastRefresh()
    if (
      !refreshTimeDiff ||
      refreshTimeDiff.minutes >= this.minutesBetweenNeededRefreshes
    ) {
      await this.forceRefresh()
    }
  }

  /**
   * Forces a refresh and updates the last referesh time.
   */
  async forceRefresh () {
    await Promise.all([
      this.performRefresh(),
      this.lastRefreshTime.markNewRefreshTime()
    ])
  }
}

class LastRefreshTime {
  private static LAST_REFRESH_KEY = "@event-arrivals-last-refresh"
  private cachedRefreshTime?: Date

  async diffFromLastRefresh () {
    const lastRefreshDate = await this.current()
    if (!lastRefreshDate) return undefined
    return diffDates(lastRefreshDate, new Date())
  }

  private async current () {
    if (this.cachedRefreshTime) return this.cachedRefreshTime
    const lastTime = await AsyncStorageUtils.parseJSONItem(
      StringDateSchema,
      LastRefreshTime.LAST_REFRESH_KEY
    )
    this.cachedRefreshTime = lastTime
    return lastTime
  }

  async markNewRefreshTime () {
    const lastTime = new Date()
    this.cachedRefreshTime = lastTime
    await AsyncStorage.setItem(
      LastRefreshTime.LAST_REFRESH_KEY,
      JSON.stringify(lastTime)
    )
  }
}

const THIRTY_MINUTES_IN_MILLIS = 1.8e6

/**
 * Sets up force refreshing every 30 minutes and needs based refreshing everytime the app foregrounds.
 */
export const setupArrivalsRefreshPolicy = (
  refresher: EventArrivalsRefresher
) => {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      refresher.refreshIfNeeded()
    }
  })
  setInterval(refresher.forceRefresh, THIRTY_MINUTES_IN_MILLIS)
}
