import AsyncStorage from "@react-native-async-storage/async-storage"
import { EventArrivalsRefresher } from "./Refresh"
import { fakeTimers } from "@test-helpers/Timers"

describe("EventArrivalsRefresher tests", () => {
  fakeTimers()
  beforeEach(async () => await AsyncStorage.clear())

  const performRefresh = jest.fn()
  beforeEach(() => performRefresh.mockReset())

  test("refresh if needed, performs refresh if no prior refereshes", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 30)
    await refresher.refreshIfNeeded()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("refresh if needed, does not perform refresh if last refresh was not <time-threshold> minutes ago", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).not.toHaveBeenCalled()
  })

  test("refresh if needed, refreshes when last refresh is at least <time-threshold> minutes ago", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:01:00"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("force refresh, ignores previous refresh time", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.forceRefresh()
    expect(performRefresh).toHaveBeenCalledTimes(1)
  })

  test("force refresh, marks new refresh time for needed refresh", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 1)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.forceRefresh()
    performRefresh.mockReset()
    jest.setSystemTime(new Date("2023-11-24T00:00:59"))
    await refresher.refreshIfNeeded()
    expect(performRefresh).not.toHaveBeenCalled()
  })

  test("time until next available refresh, basic", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 20)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    jest.setSystemTime(new Date("2023-11-24T00:08:42"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(678000)
  })

  test("time until next available refresh, zero when no prior refreshes", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 20)
    jest.setSystemTime(new Date("2023-11-24T00:08:42"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(0)
  })

  test("time until next available refresh, zero when past minute threshold", async () => {
    const refresher = new EventArrivalsRefresher(performRefresh, 20)
    jest.setSystemTime(new Date("2023-11-24T00:00:00"))
    await refresher.refreshIfNeeded()
    jest.setSystemTime(new Date("2023-11-24T00:32:16"))
    const time = await refresher.timeUntilNextRefreshAvailable()
    expect(time).toEqual(0)
  })
})
