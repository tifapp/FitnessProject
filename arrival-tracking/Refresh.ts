import { AppState } from "react-native"
import { EventArrivalsTracker } from "./Tracker"
import { TiFAPI } from "TiFShared/api"
import { LocalSettingsStore } from "@settings-storage/LocalSettings"
import { now } from "TiFShared/lib/Dayjs"
import { EventArrivals } from "./Arrivals"

/**
 * A class that manages refreshing of upcoming event arrivals.
 */
export class EventArrivalsRefresher {
  private readonly performRefresh: () => Promise<void>
  private readonly localSettings: LocalSettingsStore
  private readonly minutesBetweenNeededRefreshes: number

  private get secondsNeededBetweenRefreshes() {
    return this.minutesBetweenNeededRefreshes * 60
  }

  constructor(
    performRefresh: () => Promise<void>,
    localSettings: LocalSettingsStore,
    minutesBetweenNeededRefreshes: number
  ) {
    this.performRefresh = performRefresh
    this.localSettings = localSettings
    this.minutesBetweenNeededRefreshes = minutesBetweenNeededRefreshes
  }

  static usingTracker(
    tracker: EventArrivalsTracker,
    tifAPI: TiFAPI,
    localSettings: LocalSettingsStore,
    minutesBetweenNeededRefreshes: number
  ) {
    return new EventArrivalsRefresher(
      async () => {
        await tracker.refreshArrivals(async () => {
          const resp = await tifAPI.upcomingEventArrivalRegions()
          return EventArrivals.fromRegions(resp.data.trackableRegions)
        })
      },
      localSettings,
      minutesBetweenNeededRefreshes
    )
  }

  /**
   * Refreshes if the time from the last refresh is greater than the specified duration of minutes.
   */
  async refreshIfNeeded() {
    if (now().isSameOrAfter(await this.nextAvailableRefreshDate())) {
      await this.forceRefresh()
    }
  }

  /**
   * Returns the number of milliseconds to wait until another refresh should be performed.
   */
  async timeUntilNextRefreshAvailable() {
    const { milliseconds } = (await this.nextAvailableRefreshDate()).ext.diff(
      new Date()
    )
    return Math.max(0, milliseconds)
  }

  /**
   * Forces a refresh and updates the last referesh time.
   */
  async forceRefresh() {
    await Promise.allSettled([
      this.performRefresh(),
      this.localSettings.save({ lastEventArrivalsRefreshDate: new Date() })
    ])
  }

  private async nextAvailableRefreshDate() {
    const lastDate = (await this.localSettings.load())
      .lastEventArrivalsRefreshDate
    if (!lastDate) return new Date()
    return lastDate.ext.addSeconds(this.secondsNeededBetweenRefreshes)
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
  setTimeout(
    async () => {
      // NB: We force refresh because setTimeout delays are imprecise and thus can possibly
      // cause missed refreshes. However, this is fine since we sleep for "about the right"
      // amount of time needed to make the refreshes available.
      await refresher.forceRefresh()

      // NB: See https://developer.mozilla.org/en-US/docs/Web/API/setInterval#ensure_that_execution_duration_is_shorter_than_interval_frequency
      await setupIntervalRefreshes(refresher)
    },
    await refresher.timeUntilNextRefreshAvailable()
  )
}
