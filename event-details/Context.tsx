import { createContext, useContext } from "react"
import {
  JoinEventPermission,
  JoinEventRequest,
  JoinEventResult,
  loadJoinEventPermissions
} from "./JoinEvent"
import {
  LoadEventTravelEstimates,
  loadEventTravelEstimates
} from "./TravelEstimates"
import { EventRegionMonitor } from "./arrival-tracking"
import { TrueRegionMonitor } from "./arrival-tracking/region-monitoring/MockRegionMonitors"

export type EventDetailsContextValues = {
  regionMonitor: EventRegionMonitor
  travelEstimates: LoadEventTravelEstimates
  joinEventPermissions: () => Promise<JoinEventPermission[]>
  joinEvent: (request: JoinEventRequest) => Promise<JoinEventResult>
}

const EventDetailsContext = createContext<EventDetailsContextValues>({
  regionMonitor: TrueRegionMonitor, // NB: TODO: - Live instance
  travelEstimates: loadEventTravelEstimates,
  joinEventPermissions: loadJoinEventPermissions,
  joinEvent: async () => {
    throw new Error("TODO")
  }
})

export const useEventDetails = () => {
  return useContext(EventDetailsContext)
}

export type EventDetailsProviderProps = {
  children: JSX.Element
} & Partial<EventDetailsContextValues>

export const EventDetailsProvider = ({
  children,
  ...values
}: EventDetailsProviderProps) => {
  const currentValues = useEventDetails()
  return (
    <EventDetailsContext.Provider value={{ ...currentValues, ...values }}>
      {children}
    </EventDetailsContext.Provider>
  )
}
