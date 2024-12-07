import { ReactNode, createContext, useContext } from "react"
import { StyleProp, ViewStyle } from "react-native"
import {
  JoinEventButton,
  JoinEventPermission,
  JoinEventPermissionsSheetView,
  JoinEventRequest,
  JoinEventResult,
  joinEvent,
  loadJoinEventPermissions,
  useJoinEvent
} from "./JoinEvent"
import {
  LeaveEventButton,
  LeaveEventResult,
  leaveEvent,
  useLeaveEvent
} from "./LeaveEvent"
import { EventID, isAttendingEvent } from "TiFShared/domain-models/Event"
import { TiFAPI } from "TiFShared/api"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { EventRegionMonitor } from "@arrival-tracking"
import { TrueRegionMonitor } from "@arrival-tracking/region-monitoring/MockRegionMonitors"
import { ClientSideEvent } from "./ClientSideEvent"

export type EventUserAttendanceContextValues = {
  monitor: EventRegionMonitor
  joinEvent: (request: JoinEventRequest) => Promise<JoinEventResult>
  loadPermissions: () => Promise<JoinEventPermission[]>
  leaveEvent: (eventId: EventID) => Promise<LeaveEventResult>
}

const AttendanceContext = createContext<EventUserAttendanceContextValues>({
  // TODO: - Default join handlers and region monitor.
  monitor: TrueRegionMonitor,
  joinEvent: (request) => joinEvent(request, TiFAPI.productionInstance, []),
  loadPermissions: loadJoinEventPermissions,
  leaveEvent
})

export type EventUserAttendanceProviderProps =
  Partial<EventUserAttendanceContextValues> & {
    children: ReactNode
  }

/**
 * A provider component that provides functions needed for joining and leaving an event.
 */
export const EventUserAttendanceProvider = ({
  children,
  ...values
}: EventUserAttendanceProviderProps) => (
  <AttendanceContext.Provider
    value={mergeWithPartial(useContext(AttendanceContext), values)}
  >
    {children}
  </AttendanceContext.Provider>
)

export type EventAttendanceButtonProps = {
  event: ClientSideEvent
  onJoinSuccess: () => void
  onLeaveSuccess: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A button to act upon user attendance of an event (ie. joining and leaving).
 *
 * Use this button when you write a UI component that requires being able to join end leave an
 * event.
 */
export const EventUserAttendanceButton = ({
  event,
  onJoinSuccess,
  onLeaveSuccess,
  style
}: EventAttendanceButtonProps) => {
  const { monitor, joinEvent, loadPermissions, leaveEvent } =
    useContext(AttendanceContext)
  const joinState = useJoinEvent(event, {
    monitor,
    loadPermissions,
    joinEvent,
    onSuccess: onJoinSuccess
  })
  const leaveState = useLeaveEvent(event, {
    leaveEvent,
    onSuccess: onLeaveSuccess
  })
  return (
    <>
      {isAttendingEvent(event.userAttendeeStatus) ? (
        <LeaveEventButton state={leaveState} style={style} />
      ) : (
        <JoinEventButton state={joinState} style={style} />
      )}
      <JoinEventPermissionsSheetView state={joinState} />
    </>
  )
}
