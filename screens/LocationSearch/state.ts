import { debounceAtoms } from "@lib/Jotai"

export const searchTextAtoms = debounceAtoms("", 200)
