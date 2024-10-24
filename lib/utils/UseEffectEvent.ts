import { useRef, useInsertionEffect, useCallback } from "react"

/**
 * A pollyfill of the upcoming `useEffectEvent` in a future react version.
 *
 * `useEffectEvent` allows `useEffect` to call a function without needing it as a dependency key.
 *
 * **Notice 🟡**: Since this is just a pollyfill, the returned function will still need to be added as a dependency key.
 * However, the returned behavior is exactly the same as the hook itself.
 *
 * Ex.
 * ```ts
 * const onVisit = useEffectEvent(() => {
 *  logVisit(url, numberOfItems)
 * })
 *
 * useEffect(() => {
 *   onVisit()
 * }, [url]) // ✅ onVisit isn't needed as a dependency key
 * ```
 *
 * See: https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
 * See: https://stackoverflow.com/questions/76335194/is-this-an-accurate-polyfill-of-reacts-useeffectevent#answer-76514983
 *
 * @param fn A function to run.
 * @returns A stable reference to the given function.
 */
export const useEffectEvent = <F extends Function>(fn: F) => {
  const ref = useRef(fn)
  useInsertionEffect(() => {
    ref.current = fn
  }, [fn])
  return useCallback((...args: any[]) => {
    const f = ref.current
    return f(...args)
  }, []) as unknown as F
}
