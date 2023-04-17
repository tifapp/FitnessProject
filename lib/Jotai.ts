import { atom } from "jotai"

/**
 * Creates an atom that delays it's write operation by the specified number of milliseconds.
 * This is most useful for atoms that are used on search screens.
 *
 * @param value The initial value.
 * @param millis The number of milliseconds to delay when setting.
 */
export const atomWithDebounce = <T>(value: T, millis: number) => {
  const baseAtom = atom(value)
  let timeoutHandle: ReturnType<typeof setTimeout>
  return atom(
    (get) => get(baseAtom),
    (_, set, update: T) => {
      clearTimeout(timeoutHandle)
      timeoutHandle = setTimeout(() => set(baseAtom, update), millis)
    }
  )
}
