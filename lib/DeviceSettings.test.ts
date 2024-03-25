import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_DEVICE_SETTINGS,
  SQLiteDeviceSettingsStore
} from "./DeviceSettings"
import { waitFor } from "@testing-library/react-native"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("DeviceSettings tests", () => {
  describe("SQLiteDeviceSettingsStore tests", () => {
    let store = new SQLiteDeviceSettingsStore(testSQLite)
    resetTestSQLiteBeforeEach()
    beforeEach(() => (store = new SQLiteDeviceSettingsStore(testSQLite)))

    it("should emit the default settings when no previously saved settings", async () => {
      const callback = await initialSubscription()
      expect(callback).toHaveBeenCalledTimes(1)
      expect(store.current).toEqual(DEFAULT_DEVICE_SETTINGS)
    })

    it("should emit updates to settings", async () => {
      const callback = await initialSubscription()
      await store.save({ isHapticFeedbackEnabled: false })
      let expectedSettings = {
        ...DEFAULT_DEVICE_SETTINGS,
        isHapticFeedbackEnabled: false
      }
      expect(callback).toHaveBeenNthCalledWith(2, expectedSettings)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(store.current).toEqual(expectedSettings)

      await store.save({ isHapticAudioEnabled: false })
      expectedSettings = {
        ...DEFAULT_DEVICE_SETTINGS,
        isHapticFeedbackEnabled: false,
        isHapticAudioEnabled: false
      }
      expect(callback).toHaveBeenNthCalledWith(3, expectedSettings)
      expect(callback).toHaveBeenCalledTimes(3)
      expect(store.current).toEqual(expectedSettings)
    })

    it("should not publish identical changes", async () => {
      const callback = await initialSubscription()
      await store.save(DEFAULT_DEVICE_SETTINGS)
      expect(callback).not.toHaveBeenCalledTimes(2)
      expect(store.current).toEqual(DEFAULT_DEVICE_SETTINGS)
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
        ...DEFAULT_DEVICE_SETTINGS,
        isHapticFeedbackEnabled: false
      })
    })

    it("should carry saved data over to a new instance", async () => {
      await store.save({ isHapticFeedbackEnabled: false })
      const store2 = new SQLiteDeviceSettingsStore(testSQLite)
      const callback = jest.fn()
      store2.subscribe(callback)
      const expectedSettings = {
        ...DEFAULT_DEVICE_SETTINGS,
        isHapticFeedbackEnabled: false
      }
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(expectedSettings)
      })
      expect(store2.current).toEqual(expectedSettings)
    })

    it("should use the current value when an undefined property is saved", async () => {
      const callback = await initialSubscription()
      await store.save({
        isHapticAudioEnabled: undefined,
        isHapticFeedbackEnabled: false
      })
      expect(callback).toHaveBeenNthCalledWith(2, {
        ...DEFAULT_DEVICE_SETTINGS,
        isHapticAudioEnabled: true,
        isHapticFeedbackEnabled: false
      })
    })

    it("should do the initial emission immediately when new subscription after initial subscription", async () => {
      await initialSubscription()
      const callback = jest.fn()
      store.subscribe(callback)
      expect(callback).toHaveBeenCalledWith(DEFAULT_DEVICE_SETTINGS)
    })

    const initialSubscription = async () => {
      const callback = jest.fn()
      store.subscribe(callback)
      await waitForDefaultSettingsEmission(callback)
      return callback
    }

    const waitForDefaultSettingsEmission = async (callback: jest.Mock) => {
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(DEFAULT_DEVICE_SETTINGS)
      })
    }
  })
})
