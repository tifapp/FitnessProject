import { useCallback, useEffect, useRef } from "react"

export const useThrottle = (callback: Function, delay: number) => {
  const lastExecutedRef = useRef<number>(0)
  const callbackRef = useRef(callback)

  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args: any[]) => {
      const now = Date.now()
      if (now - lastExecutedRef.current >= delay) {
        lastExecutedRef.current = now
        return callbackRef.current(...args)
      }
    },
    [delay]
  ) // callback is accessed via ref, so not needed in deps
}
