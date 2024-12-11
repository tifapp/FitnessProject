import React from "react"
import { TiFView } from "@core-root"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { eventsByRegion } from "@explore-events-boundary"
import { AlphaUserMocks } from "@user/alpha/MockData"

const TiFPreview = {
  title: "TiF Preview"
}

export default TiFPreview

const storage = AlphaUserStorage.ephemeral(AlphaUserMocks.Blob)

export const Basic = () => (
  <AlphaUserSessionProvider storage={storage}>
    <TiFView
      fetchEvents={async () => [
        clientSideEventFromResponse(EventMocks.MockMultipleAttendeeResponse)
      ]}
      isFontsLoaded={true}
      style={{ flex: 1 }}
    />
  </AlphaUserSessionProvider>
)
