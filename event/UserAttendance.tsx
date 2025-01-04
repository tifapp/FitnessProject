import { StyleProp, ViewStyle } from "react-native"
import {
  JoinEventButton,
  JoinEventPermissionsSheetView,
  joinEvent,
  loadJoinEventPermissions,
  useJoinEvent
} from "./JoinEvent"
import { LeaveEventButton, leaveEvent, useLeaveEvent } from "./LeaveEvent"
import { isAttendingEvent } from "TiFShared/domain-models/Event"
import { TrueRegionMonitor } from "@arrival-tracking/region-monitoring/MockRegionMonitors"
import { ClientSideEvent } from "./ClientSideEvent"
import { BoldFootnote, Headline } from "@components/Text"
import { featureContext } from "@lib/FeatureContext"

export const EventUserAttendanceFeature = featureContext({
  // TODO: - Default region monitor.
  monitor: TrueRegionMonitor,
  joinEvent,
  loadPermissions: loadJoinEventPermissions,
  leaveEvent
})

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
    EventUserAttendanceFeature.useContext()
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
