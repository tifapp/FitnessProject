import React from "react"
import { TiFView } from "@core-root"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { eventsByRegion } from "@explore-events-boundary"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { PersistentSettingsStore } from "@settings-storage/PersistentStore"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { TiFSQLite } from "@lib/SQLite"
import { testSQLite } from "@test-helpers/SQLite"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { SettingsProvider } from "@settings-storage/Hooks"
import { EditEventFeature } from "@edit-event-boundary/EditEvent"
import { repeatElements } from "TiFShared/lib/Array"
import { uuidString } from "@lib/utils/UUID"
import { randomIntegerInRange } from "@lib/utils/Random"

const TiFPreview = {
  title: "TiF Preview"
}

export default TiFPreview

const storage = AlphaUserStorage.ephemeral()
const localSettings = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)
const userSettings = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)
userSettings.update({
  eventPresetDurations: [3900, 7500, 8400, 12300, 9500, 13700]
})

export const Basic = () => (
  <SettingsProvider
    localSettingsStore={localSettings}
    userSettingsStore={userSettings}
  >
    <AlphaUserSessionProvider storage={storage}>
      <TiFView
        fetchEvents={eventsByRegion}
        isFontsLoaded={true}
        style={{ flex: 1 }}
      />
    </AlphaUserSessionProvider>
  </SettingsProvider>
)
