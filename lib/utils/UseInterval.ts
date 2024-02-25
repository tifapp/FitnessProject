import { useRef, useEffect, useInsertionEffect } from "react"

/**
 * A hook that runs the callback on an interval of length `intervalMillis`.
 */
export function useInterval(
  callback: () => void,
  intervalMillis: number | null
) {
  const savedCallback = useRef(callback)

  useInsertionEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (intervalMillis === null) {
      return
    }

    const id = setInterval(() => {
      savedCallback.current()
    }, intervalMillis)

    return () => {
      clearInterval(id)
    }
  }, [intervalMillis])
}
