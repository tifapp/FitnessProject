import {
  clearAutocorrectingInterval,
  setAutocorrectingInterval
} from "@lib/AutocorrectingInterval"
import { useRef, useEffect, useInsertionEffect } from "react"

/**
 * A hook that runs the callback on an interval of length `intervalMillis`.
 */
export const useAutocorrectingInterval = (
  callback: () => void,
  intervalMillis: number
) => {
  const savedCallback = useRef(callback)

  useInsertionEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const interval = setAutocorrectingInterval(() => {
      savedCallback.current()
    }, intervalMillis)
    return () => clearAutocorrectingInterval(interval)
  }, [intervalMillis])
}
