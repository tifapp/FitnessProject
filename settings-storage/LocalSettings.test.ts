import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_LOCAL_SETTINGS,
  SQLiteLocalSettingsStorage,
  SQLiteLocalSettingsStore
} from "./LocalSettings"
import { waitFor } from "@testing-library/react-native"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("LocalSettings tests", () => {
  describe("SQLiteLocalSettingsStorage tests", () => {
    resetTestSQLiteBeforeEach()
    const storage = new SQLiteLocalSettingsStorage(testSQLite)

    it("should return the default settings when calling load with no changes", async () => {
      const settings = await storage.load()
      expect(settings).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should return the updated settings when calling load with changes", async () => {
      await storage.save({ hasCompletedOnboarding: true })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        hasCompletedOnboarding: true
      })
    })

    it("should merge changes when saving", async () => {
      await storage.save({ hasCompletedOnboarding: true })
      await storage.save({ isHapticAudioEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        hasCompletedOnboarding: true,
        isHapticAudioEnabled: false
      })
    })
  })

  describe("SQLiteDeviceSettingsStore tests", () => {
    let store = new SQLiteLocalSettingsStore(testSQLite)
    resetTestSQLiteBeforeEach()
    beforeEach(() => (store = new SQLiteLocalSettingsStore(testSQLite)))

    it("should return the default settings when calling load with no changes", async () => {
      const settings = await store.load()
      expect(settings).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should return the updated settings when calling load with changes", async () => {
      await store.save({ hasCompletedOnboarding: true })
      const settings = await store.load()
      expect(settings).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        hasCompletedOnboarding: true
      })
    })

    it("should emit the default settings when no previously saved settings", async () => {
      const callback = await initialSubscription()
      expect(callback).toHaveBeenCalledTimes(1)
      expect(store.current).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should emit updates to settings", async () => {
      const callback = await initialSubscription()
      await store.save({ isHapticFeedbackEnabled: false })
      let expectedSettings = {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false
      }
      expect(callback).toHaveBeenNthCalledWith(2, expectedSettings)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(store.current).toEqual(expectedSettings)

      const newDate = new Date()
      await store.save({
        isHapticAudioEnabled: false,
        lastEventArrivalsRefreshDate: newDate
      })
      expectedSettings = {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false,
        isHapticAudioEnabled: false,
        lastEventArrivalsRefreshDate: newDate
      }
      expect(callback).toHaveBeenNthCalledWith(3, expectedSettings)
      expect(callback).toHaveBeenCalledTimes(3)
      expect(store.current).toEqual(expectedSettings)
    })

    it("should not publish identical changes", async () => {
      const callback = await initialSubscription()
      await store.save(DEFAULT_LOCAL_SETTINGS)
      expect(callback).not.toHaveBeenCalledTimes(2)
      expect(store.current).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should not receive updates after unsubscribing", async () => {
      const callback = jest.fn()
      const unsub = store.subscribe(callback)
      unsub()
      await store.save({ isHapticFeedbackEnabled: false })
      await verifyNeverOccurs(() => {
        expect(callback).toHaveBeenCalled()
      })
      expect(store.current).toEqual({
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false
      })
    })

    it("should carry saved data over to a new instance", async () => {
      await store.save({ isHapticFeedbackEnabled: false })
      const store2 = new SQLiteLocalSettingsStore(testSQLite)
      const callback = jest.fn()
      store2.subscribe(callback)
      const expectedSettings = {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false
      }
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(expectedSettings)
      })
      expect(store2.current).toEqual(expectedSettings)
    })

    it("should carry saved data over to a new instance without subscribing to new instance", async () => {
      await store.save({
        isHapticFeedbackEnabled: false,
        hasCompletedOnboarding: true
      })
      const store2 = new SQLiteLocalSettingsStore(testSQLite)
      const expectedSettings = {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false,
        hasCompletedOnboarding: true
      }
      expect(await store2.load()).toEqual(expectedSettings)
    })

    it("should persist changes to SQLite when saved regardless if the saved changes are equal to the current changes", async () => {
      const date = new Date(1000)
      await store.save({ lastEventArrivalsRefreshDate: date })
      const store2 = new SQLiteLocalSettingsStore(testSQLite)
      await store2.save(DEFAULT_LOCAL_SETTINGS)
      expect(await store2.load()).toEqual(DEFAULT_LOCAL_SETTINGS)
    })

    it("should update all subscriptions when load returns a different value than current", async () => {
      await store.save({
        isHapticFeedbackEnabled: false,
        hasCompletedOnboarding: true
      })
      const store2 = new SQLiteLocalSettingsStore(testSQLite)
      const callback = jest.fn()
      store2.subscribe(callback)
      await store.save({ lastEventArrivalsRefreshDate: new Date(1000) })
      await store2.load()

      const expectedSettings = {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticFeedbackEnabled: false,
        hasCompletedOnboarding: true,
        lastEventArrivalsRefreshDate: new Date(1000)
      }
      await waitFor(() => {
        expect(callback).toHaveBeenNthCalledWith(2, expectedSettings)
      })
      expect(store2.current).toEqual(expectedSettings)
    })

    it("should not update any subscriptions when load returns the same value as current", async () => {
      const callback = await initialSubscription()
      await store.load()
      await verifyNeverOccurs(() => {
        expect(callback).toHaveBeenCalledTimes(2)
      })
    })

    it("should use the current value when an undefined property is saved", async () => {
      const callback = await initialSubscription()
      await store.save({
        isHapticAudioEnabled: undefined,
        isHapticFeedbackEnabled: false
      })
      expect(callback).toHaveBeenNthCalledWith(2, {
        ...DEFAULT_LOCAL_SETTINGS,
        isHapticAudioEnabled: true,
        isHapticFeedbackEnabled: false
      })
    })

    it("should do the initial emission immediately when new subscription after initial subscription", async () => {
      await initialSubscription()
      const callback = jest.fn()
      store.subscribe(callback)
      expect(callback).toHaveBeenCalledWith(DEFAULT_LOCAL_SETTINGS)
    })

    const initialSubscription = async () => {
      const callback = jest.fn()
      store.subscribe(callback)
      await waitForDefaultSettingsEmission(callback)
      return callback
    }

    const waitForDefaultSettingsEmission = async (callback: jest.Mock) => {
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(DEFAULT_LOCAL_SETTINGS)
      })
    }
  })
})
