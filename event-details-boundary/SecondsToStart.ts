import { useAutocorrectingInterval } from "@lib/AutocorrectingInterval"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { useState } from "react"

export type UseEventSecondsToStartProps = Pick<
  ClientSideEvent["time"],
  "secondsToStart" | "clientReceivedTime"
>

const eventSecondsToStart = (props: UseEventSecondsToStartProps) => {
  const offset = now().diff(dayjs(props.clientReceivedTime))
  return props.secondsToStart - Math.round(offset / 1000)
}

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
