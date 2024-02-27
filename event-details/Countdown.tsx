import { diffDates } from "@date-time"
import { useInterval } from "@lib/utils/UseInterval"
import { CurrentUserEvent } from "@shared-models/Event"
import { useState } from "react"

export type UseEventCountdownTime = Omit<
  CurrentUserEvent["time"],
  "todayOrTomorrow"
>

const initialSecondsToStart = (time: UseEventCountdownTime) => {
  const { seconds } = diffDates(new Date(), time.clientReceivedTime)
  return time.secondsToStart - seconds
}

export type FormattedCountdown =
  | {
      todayOrTomorrow: "Today" | "Tomorrow"
    }
  | { left: number; right: number }
  | { formatted: string }

const formatCountdownSeconds = () => {
  // if (time.todayOrTomorrow === "tomorrow") {
  //   return { todayOrTomorrow: "Tomorrow" }
  // } else if (time.todayOrTomorrow === "today") {
  //   const duration = dayjs.duration(secondsToStart, "second")
  //   if (duration.asHours() > TODAY_THRESHOLD_HOURS) {
  //     return { todayOrTomorrow: "Today" }
  //   } else if (duration.asHours() < 1) {
  //     return {
  //       left: Math.floor(duration.asMinutes()),
  //       right: Math.floor(duration.asSeconds() % 60)
  //     }
  //   } else {
  //     return {
  //       left: Math.floor(duration.hours()),
  //       right: Math.floor(duration.asMinutes() % 60)
  //     }
  //   }
  // } else {
  //   return { formatted: "" }
  // }
}

export const useEventCountdownSeconds = (time: UseEventCountdownTime) => {
  const [secondsToStart, setSecondsToStart] = useState(
    initialSecondsToStart(time)
  )
  useInterval(() => setSecondsToStart((s) => s - 1), 1000)
  if (secondsToStart > 0) {
    return { status: "starts-in", seconds: secondsToStart }
  }
  const { seconds } = time.dateRange.diff
  const secondsToEnd = seconds - Math.abs(secondsToStart)
  return secondsToEnd <= 0
    ? { status: "done" }
    : { status: "ends-in", seconds: secondsToEnd }
}
