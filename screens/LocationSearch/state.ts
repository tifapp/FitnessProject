import { debounceAtomGroup } from "@lib/Jotai"

export const searchTextAtoms = debounceAtomGroup("", 200)
