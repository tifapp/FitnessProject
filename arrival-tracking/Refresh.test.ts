import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { fakeTimers } from "@test-helpers/Timers"
import { TiFAPI } from "TiFShared/api"
import { repeatElements } from "TiFShared/lib/Array"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { EventArrivals } from "./Arrivals"
import { TestEventArrivalsGeofencer } from "./geofencing/TestGeofencer"
import { mockEventArrivalRegion } from "./MockData"
import { EventArrivalsRefresher } from "./Refresh"
import { SQLiteEventArrivalsStorage } from "./Storage"
import { expectOrderInsensitiveEventArrivals } from "./TestHelpers"
import { EventArrivalsTracker } from "./Tracker"

describe("EventArrivalsRefresher tests", () => {
  resetTestSQLiteBeforeEach()
  const storage = new SQLiteLocalSettingsStorage(testSQLite)
  fakeTimers()

  const performRefresh = jest.fn()
  beforeEach(() => performRefresh.mockReset())

  test("refresh if needed, performs refresh if no prior refereshes", async () => {
    const refresher = createRefresher(30)
    await refresher.refreshIfNeeded()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("refresh if needed, does not perform refresh if last refresh was not <time-threshold> minutes ago", async () => {
    const refresher = createRefresher(1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).not.toHaveBeenCalled()
  })

  test("refresh if needed, refreshes when last refresh is at least <time-threshold> minutes ago", async () => {
    const refresher = createRefresher(1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:01:00"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("force refresh, ignores previous refresh time", async () => {
    const refresher = createRefresher(1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.forceRefresh()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("force refresh, marks new refresh time for needed refresh", async () => {
    const refresher = createRefresher(1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.forceRefresh()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).not.toHaveBeenCalled()
  })

  test("time until next available refresh, basic", async () => {
    const refresher = createRefresher(20)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    jest.setSystemTime(new Date("2023-11-24T00:08:42"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(678000)
  })

  test("time until next available refresh, zero when no prior refreshes", async () => {
    const refresher = createRefresher(20)
    jest.setSystemTime(new Date("2023-11-24T00:08:42"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(0)
  })

  test("time until next available refresh, zero when past minute threshold", async () => {
    const refresher = createRefresher(20)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    jest.setSystemTime(new Date("2023-11-24T00:32:16"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(0)
  })

  test("refresh using tracker", async () => {
    const tracker = new EventArrivalsTracker(
      new SQLiteEventArrivalsStorage(testSQLite),
      new TestEventArrivalsGeofencer(),
      jest.fn()
    )
    const refresher = EventArrivalsRefresher.usingTracker(
      tracker,
      TiFAPI.testAuthenticatedInstance,
      storage,
      20
    )
    const trackableRegions = repeatElements(3, () => mockEventArrivalRegion())
    mockTiFEndpoint("upcomingEventArrivalRegions", 200, { trackableRegions })

    await refresher.forceRefresh()
    expectOrderInsensitiveEventArrivals(
      await tracker.trackedArrivals(),
      EventArrivals.fromRegions(trackableRegions)
    )
  })

  const createRefresher = (minutesBetweenNeededRefreshes: number) => {
    return new EventArrivalsRefresher(
      performRefresh,
      storage,
      minutesBetweenNeededRefreshes
    )
  }
})
