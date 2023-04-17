import { atomWithDebounce } from "@lib/Jotai"

export const searchTextAtom = atomWithDebounce("", 100)
