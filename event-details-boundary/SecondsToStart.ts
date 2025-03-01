import { useAutocorrectingInterval } from "@lib/AutocorrectingInterval"
import { ClientSideEvent, eventSecondsToStart } from "@event/ClientSideEvent"
import { useState } from "react"

export type UseEventSecondsToStartProps = Pick<
  ClientSideEvent["time"],
  "secondsToStart" | "clientReceivedTime"
>
/**
 * Returns the number of seconds until the event starts at every second.
 *
 * A negative return value from this function indicates the amount of seconds
 * since the event has started.
 */
export const useEventSecondsToStart = (props: UseEventSecondsToStartProps) => {
  const [secondsToStart, setSecondsToStart] = useState(
    eventSecondsToStart(props)
  )
  useAutocorrectingInterval(
    () => setSecondsToStart(eventSecondsToStart(props)),
    1000
  )
  return secondsToStart
}
