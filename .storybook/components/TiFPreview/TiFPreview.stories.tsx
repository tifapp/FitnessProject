import React from "react"
import { TiFView } from "@core-root"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { eventsByRegion } from "@explore-events-boundary"

const TiFPreview = {
  title: "TiF Preview"
}

export default TiFPreview

const storage = AlphaUserStorage.ephemeral()

export const Basic = () => (
  <AlphaUserSessionProvider storage={storage}>
    <TiFView
      fetchEvents={eventsByRegion}
      isFontsLoaded={true}
      style={{ flex: 1 }}
    />
  </AlphaUserSessionProvider>
)
