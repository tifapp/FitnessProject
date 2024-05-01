import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  SQLiteUserSettingsStorage,
  UserSettingsSynchronizingStore,
  userSettingsRefreshAction,
  userSettingsStore
} from "./UserSettings"
import { DEFAULT_USER_SETTINGS } from "TiFShared/domain-models/User"
import { fakeTimers } from "@test-helpers/Timers"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { mswServer } from "@test-helpers/msw"
import { TiFAPI } from "TiFShared/api"
import {
  UserSettingsResponse,
  UpdateUserSettingsRequest
} from "TiFShared/api/models/User"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { http, HttpResponse } from "msw"
import { waitFor } from "@testing-library/react-native"
import { createTestQueryClient } from "@test-helpers/ReactQuery"

describe("UserSettings tests", () => {
  describe("SQLiteUserSettingsStorage tests", () => {
    resetTestSQLiteBeforeEach()
    const storage = new SQLiteUserSettingsStorage(testSQLite)

    it("should return the default settings when calling load with no changes", async () => {
      const settings = await storage.load()
      expect(settings).toEqual(DEFAULT_USER_SETTINGS)
    })

    it("should return the updated settings when calling load with changes", async () => {
      await storage.save({ isAnalyticsEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false
      })
    })

    it("should merge changes when saving", async () => {
      await storage.save({ canShareArrivalStatus: false })
      await storage.save({ isCrashReportingEnabled: false })
      const settings = await storage.load()
      expect(settings).toEqual({
        ...DEFAULT_USER_SETTINGS,
        canShareArrivalStatus: false,
        isCrashReportingEnabled: false
      })
    })
  })

  describe("UserSettingsRefreshAction tests", () => {
    it("should return default settings if both results are rejected", () => {
      const settings = userSettingsRefreshAction(
        { status: "rejected" },
        { status: "rejected" }
      )
      expect(settings).toEqual({
        status: "neither",
        settings: DEFAULT_USER_SETTINGS
      })
    })

    it("should return remote settings if local is rejected and remote is not", () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false
      }
      const settings = userSettingsRefreshAction(
        { status: "rejected" },
        { status: "fulfilled", value: expectedSettings }
      )
      expect(settings).toEqual({
        status: "pull-remote",
        settings: expectedSettings
      })
    })

    it("should return local settings if remote is rejected and local is not", () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false
      }
      const settings = userSettingsRefreshAction(
        { status: "fulfilled", value: expectedSettings },
        { status: "rejected" }
      )
      expect(settings).toEqual({
        status: "no-push-local",
        settings: expectedSettings
      })
    })

    it("should return local settings if version >= remote version", () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false,
        version: 6
      }
      const settings = userSettingsRefreshAction(
        { status: "fulfilled", value: expectedSettings },
        { status: "fulfilled", value: { ...DEFAULT_USER_SETTINGS, version: 6 } }
      )
      expect(settings).toEqual({
        status: "push-local",
        settings: expectedSettings
      })
    })

    it("should return remote settings if version > local version", () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false,
        version: 6
      }
      const settings = userSettingsRefreshAction(
        {
          status: "fulfilled",
          value: { ...DEFAULT_USER_SETTINGS, version: 5 }
        },
        { status: "fulfilled", value: expectedSettings }
      )
      expect(settings).toEqual({
        status: "pull-remote",
        settings: expectedSettings
      })
    })
  })

  describe("UserSettingsSynchronizingStore tests", () => {
    afterEach(() => jest.clearAllTimers())
    fakeTimers()
    resetTestSQLiteBeforeEach()

    const TEST_DEBOUNCE_MILLIS = 5000
    const storage = new SQLiteUserSettingsStorage(testSQLite)
    let store: UserSettingsSynchronizingStore
    beforeEach(() => {
      resetSavedAPISettings()
      store = userSettingsStore(
        storage,
        TiFAPI.testAuthenticatedInstance,
        createTestQueryClient(),
        TEST_DEBOUNCE_MILLIS,
        0
      )
    })

    it("should debounce saves to the API", async () => {
      const saveRequest = {
        isAnalyticsEnabled: false,
        canShareArrivalStatus: false
      }
      store.update(saveRequest)
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS / 2)

      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        ...saveRequest
      }
      await verifyNeverOccurs(() => {
        expect(savedAPISettings).toEqual(expectedSettings)
      })

      setupUpdateSettingsEndpoint()
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS / 2)
      await waitFor(() => {
        expect(savedAPISettings).toEqual(expectedSettings)
      })
    })

    it("should reset the save debounce timer for each save", async () => {
      store.update({
        isAnalyticsEnabled: false,
        canShareArrivalStatus: false
      })
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS / 2)
      store.update({
        canShareArrivalStatus: true,
        isCrashReportingEnabled: false
      })
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS / 2)

      const expectedSaveRequest = {
        canShareArrivalStatus: true,
        isAnalyticsEnabled: false,
        isCrashReportingEnabled: false
      }
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        ...expectedSaveRequest
      }
      await verifyNeverOccurs(() => {
        expect(savedAPISettings).toEqual(expectedSettings)
      })

      setupUpdateSettingsEndpoint()
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS / 2)
      await waitFor(() => {
        expect(savedAPISettings).toEqual(expectedSettings)
      })
    })

    it("should be able to flush any debounced updates in order to save the changes immediately", async () => {
      const saveRequest = {
        isAnalyticsEnabled: false,
        isMentionsNotificationsEnabled: false
      }

      store.update(saveRequest)
      setupUpdateSettingsEndpoint()
      store.flushPendingChanges()

      await waitFor(() => {
        expect(savedAPISettings).toEqual({
          ...DEFAULT_USER_SETTINGS,
          ...saveRequest
        })
      })
    })

    test("flushing twice in a row only attempts to save settings once", async () => {
      setupUpdateSettingsEndpoint()
      store.update({ isAnalyticsEnabled: false })
      await store.flushPendingChanges()
      expect(savedAPISettings.isAnalyticsEnabled).toEqual(false)
      resetSavedAPISettings()
      await store.flushPendingChanges()
      expect(savedAPISettings.isAnalyticsEnabled).not.toEqual(false)
    })

    it("should remove the current debounce update after flushing", async () => {
      setupUpdateSettingsEndpoint()
      store.update({ isAnalyticsEnabled: false })
      await store.flushPendingChanges()
      resetSavedAPISettings()
      jest.advanceTimersByTime(TEST_DEBOUNCE_MILLIS)
      await verifyNeverOccurs(() => {
        expect(savedAPISettings.isAnalyticsEnabled).toEqual(false)
      })
    })

    it("should save the newly returned settings after flushing", async () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false,
        canShareArrivalStatus: false,
        version: 5
      }
      savedAPISettings = expectedSettings
      setupUpdateSettingsEndpoint()

      store.update({ isAnalyticsEnabled: false })
      await store.flushPendingChanges()
      expect(await storage.load()).toEqual(expectedSettings)
    })

    it("should use the stored settings when subscribing", async () => {
      await storage.save({ isCrashReportingEnabled: false })
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isCrashReportingEnabled: false
      }
      setGetSettingsResponse(expectedSettings)
      const callback = jest.fn()
      store.subscribe(callback)
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(expectedSettings)
      })
    })

    it("should publish the API settings when refreshing", async () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false,
        isMentionsNotificationsEnabled: false,
        version: DEFAULT_USER_SETTINGS.version + 1
      }
      setGetSettingsResponse(expectedSettings)
      const callback = jest.fn()
      store.subscribe(callback)
      await store.refresh()
      expect(callback).toHaveBeenCalledWith(expectedSettings)
    })

    it("should save the API settings locally when refreshing", async () => {
      const expectedSettings = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false,
        isMentionsNotificationsEnabled: false,
        version: DEFAULT_USER_SETTINGS.version + 1
      }
      setGetSettingsResponse(expectedSettings)
      await store.refresh()
      expect(await storage.load()).toEqual(expectedSettings)
    })

    it("should cancel the debounced update when refreshing", async () => {
      setupGetSettingsErrorResponse()
      setupUpdateSettingsEndpoint()
      store.update({ isAnalyticsEnabled: false })
      await store.refresh()
      await store.flushPendingChanges()
      expect(savedAPISettings.isAnalyticsEnabled).not.toEqual(false)
    })

    it("should push the stored settings to the API if the version >= API version on refresh", async () => {
      await storage.save({ isAnalyticsEnabled: false, version: 5 })
      setGetSettingsResponse({
        ...DEFAULT_USER_SETTINGS,
        isCrashReportingEnabled: false,
        version: 5
      })
      const { version, ...expectedSettings } = {
        ...DEFAULT_USER_SETTINGS,
        isAnalyticsEnabled: false
      }
      setupUpdateSettingsEndpoint()

      await store.refresh()
      expect(savedAPISettings).toEqual(
        expect.objectContaining(expectedSettings)
      )
    })

    it("should publish the stored settings when failing to fetch API settings on refresh", async () => {
      const updatedSettings = { isAnalyticsEnabled: false, version: 6 }
      setupGetSettingsErrorResponse()
      const callback = jest.fn()
      store.subscribe(callback)
      await storage.save(updatedSettings)
      await store.refresh()
      expect(callback).toHaveBeenCalledWith({
        ...DEFAULT_USER_SETTINGS,
        ...updatedSettings
      })
    })

    it("should publish the stored settings when failing to push settings to API refresh", async () => {
      const updatedSettings = { isAnalyticsEnabled: false, version: 6 }
      setGetSettingsResponse({
        ...DEFAULT_USER_SETTINGS,
        isCrashReportingEnabled: false,
        version: 5
      })
      setupUpdateSettingsFailingEndpoint()
      const callback = jest.fn()
      store.subscribe(callback)
      await storage.save(updatedSettings)
      await store.refresh()
      expect(callback).toHaveBeenCalledWith({
        ...DEFAULT_USER_SETTINGS,
        ...updatedSettings
      })
    })

    let savedAPISettings = DEFAULT_USER_SETTINGS

    const USER_SETTINGS_ENDPOINT_PATH = TiFAPI.testPath("/user/self/settings")

    const setGetSettingsResponse = (settings: UserSettingsResponse) => {
      mswServer.use(
        http.get(USER_SETTINGS_ENDPOINT_PATH, async () => {
          return HttpResponse.json(settings)
        })
      )
    }

    const setupGetSettingsErrorResponse = () => {
      mswServer.use(
        http.get(USER_SETTINGS_ENDPOINT_PATH, async () => {
          return HttpResponse.error()
        })
      )
    }

    const setupUpdateSettingsEndpoint = () => {
      mswServer.use(
        http.patch(USER_SETTINGS_ENDPOINT_PATH, async ({ request }) => {
          const body = (await request.json()) as UpdateUserSettingsRequest
          savedAPISettings = mergeWithPartial(savedAPISettings, body)
          return HttpResponse.json(savedAPISettings, { status: 200 })
        })
      )
    }

    const setupUpdateSettingsFailingEndpoint = () => {
      mswServer.use(
        http.patch(USER_SETTINGS_ENDPOINT_PATH, async () => {
          return HttpResponse.error()
        })
      )
    }

    const resetSavedAPISettings = () => {
      savedAPISettings = DEFAULT_USER_SETTINGS
    }
  })
})
