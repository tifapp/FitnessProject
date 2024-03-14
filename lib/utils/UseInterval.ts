import {
  clearAutocorrectingInterval,
  setAutocorrectingInterval
} from "@lib/AutocorrectingInterval"
import { useEffect } from "react"
import { useEffectEvent } from "./UseEffectEvent"

/**
 * A hook that runs the callback on an interval of length `intervalMillis`.
 */
export const useAutocorrectingInterval = (
  callback: () => void,
  intervalMillis: number
) => {
  const callbackEvent = useEffectEvent(callback)
  useEffect(() => {
    const interval = setAutocorrectingInterval(() => {
      callbackEvent()
    }, intervalMillis)
    return () => clearAutocorrectingInterval(interval)
  }, [intervalMillis, callbackEvent])
}
