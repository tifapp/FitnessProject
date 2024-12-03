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
import { BoldFootnote, Headline } from "@components/Text"

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
  size?: "small" | "normal"
  maximumFontSizeMultiplier?: number
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
  size = "normal",
  maximumFontSizeMultiplier,
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
  const Text = SIZE_TEXT_COMPONENT[size]
  return (
    <>
      {isAttendingEvent(event.userAttendeeStatus) ? (
        <LeaveEventButton
          Text={Text}
          maximumFontSizeMultipler={maximumFontSizeMultiplier}
          state={leaveState}
          style={style}
        />
      ) : (
        <JoinEventButton
          Text={Text}
          maximumFontSizeMultipler={maximumFontSizeMultiplier}
          state={joinState}
          style={style}
        />
      )}
      <JoinEventPermissionsSheetView state={joinState} />
    </>
  )
}

const SIZE_TEXT_COMPONENT = {
  small: BoldFootnote,
  normal: Headline
}
