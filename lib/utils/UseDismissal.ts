import { useEffect } from "react"
import { useEffectEvent } from "./UseEffectEvent"
import { useAppState } from "@lib/AppState"

/**
 * Runs the given callback when either the component unmounts, or when the app
 * is backgrounded.
 */
export const useDismissal = (onDismiss: () => void) => {
  const fn = useEffectEvent(onDismiss)
  const appState = useAppState()
  useEffect(() => fn, [fn])
  useEffect(() => {
    const subscription = appState.addEventListener("change", (status) => {
      if (status !== "active") fn()
    })
    return () => subscription.remove()
  }, [fn, appState])
}
