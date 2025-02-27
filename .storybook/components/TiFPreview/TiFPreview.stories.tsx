import { TiFView } from "@core-root"
import { EventMocks } from "@event-details-boundary/MockData"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { LiveEventsFeature, LiveEventsStore } from "@event/LiveEvents"
import { eventsByRegion } from "@explore-events-boundary"
import { tiFQueryClient } from "@lib/ReactQuery"
import { sleep } from "@lib/utils/DelayData"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { testSQLite } from "@test-helpers/SQLite"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { repeatElements } from "TiFShared/lib/Array"
import React from "react"
import { UserProfileFeature } from "user-profile-boundary/Context"

const TiFPreview = {
  title: "TiF Preview"
}

export default TiFPreview

const storage = AlphaUserStorage.default
// storage.removeUserToken()

const localSettings = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)
const userSettings = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)
userSettings.update({
  eventPresetDurations: [3900, 7500, 8400, 12300, 9500, 13700]
})

const store = new LiveEventsStore(tiFQueryClient, async () => {
  const ongoingEvent = clientSideEventFromResponse({
    ...EventMocks.MockSingleAttendeeResponse,
    time: {
      ...EventMocks.MockSingleAttendeeResponse.time,
      secondsToStart: -100
    }
  })
  await sleep(3000)
  return {
    ongoing: repeatElements(3, (i) => ({ ...ongoingEvent, id: i })),
    startingSoon: []
  }
})
store.observeUserChanges(storage)

export const Basic = () => (
  <SettingsProvider
    localSettingsStore={localSettings}
    userSettingsStore={userSettings}
  >
    <LiveEventsFeature.Provider store={store}>
      <UserProfileFeature.Provider>
        <AlphaUserSessionProvider storage={storage}>
          <TiFView
            fetchEvents={eventsByRegion}
            isFontsLoaded={true}
            style={{ flex: 1 }}
          />
        </AlphaUserSessionProvider>
      </UserProfileFeature.Provider>
    </LiveEventsFeature.Provider>
  </SettingsProvider>
)
