import { createContext, useContext } from "react"
import {
  JoinEventPermission,
  JoinEventRequest,
  JoinEventResult,
  JoinEventSuccessHandler,
  joinEvent,
  loadJoinEventPermissions
} from "./JoinEvent"
import {
  LoadEventTravelEstimates,
  loadEventTravelEstimates
} from "./TravelEstimates"
import { EventRegionMonitor } from "./arrival-tracking"
import { TrueRegionMonitor } from "./arrival-tracking/region-monitoring/MockRegionMonitors"
import { TiFAPI } from "@api-client/TiFAPI"

export type EventDetailsEnvironment = {
  regionMonitor: EventRegionMonitor
  travelEstimates: LoadEventTravelEstimates
  joinEventPermissions: () => Promise<JoinEventPermission[]>
  joinEvent: (request: JoinEventRequest) => Promise<JoinEventResult>
}

// TODO: - Implement this
export const DEFAULT_JOIN_EVENT_HANDLERS = [] as JoinEventSuccessHandler[]

const EventDetailsContext = createContext<EventDetailsEnvironment>({
  regionMonitor: TrueRegionMonitor, // NB: TODO: - Live instance
  travelEstimates: loadEventTravelEstimates,
  joinEventPermissions: loadJoinEventPermissions,
  joinEvent: async (request) => {
    return await joinEvent(
      request,
      TiFAPI.productionInstance,
      DEFAULT_JOIN_EVENT_HANDLERS
    )
  }
})

export const useEventDetailsEnvironment = () => {
  return useContext(EventDetailsContext)
}

export type EventDetailsEnvironmentProviderProps = {
  children: JSX.Element
} & Partial<EventDetailsEnvironment>

export const EventDetailsEnvironmentProvider = ({
  children,
  ...values
}: EventDetailsEnvironmentProviderProps) => {
  const currentValues = useEventDetailsEnvironment()
  return (
    <EventDetailsContext.Provider value={{ ...currentValues, ...values }}>
      {children}
    </EventDetailsContext.Provider>
  )
}
