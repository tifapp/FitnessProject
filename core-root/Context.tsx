import { ClientSideEvent } from "@event/ClientSideEvent"
import { ExploreEventsRegion } from "@explore-events-boundary"
import { createContext } from "react"

export type TiFContextValues = {
  fetchEvents: (
    region: ExploreEventsRegion,
    signal?: AbortSignal
  ) => Promise<ClientSideEvent[]>
}

export const TiFContext = createContext<TiFContextValues | undefined>(undefined)
