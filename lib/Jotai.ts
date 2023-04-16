import { atom } from "jotai"

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
