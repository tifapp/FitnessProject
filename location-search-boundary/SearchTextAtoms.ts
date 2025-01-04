import { atom } from "jotai"
import { debounceAtomGroup } from "@lib/Jotai"
import { LocationsSearchQueryText } from "./SearchClient"

export const searchTextAtoms = debounceAtomGroup("", 200)

export const debouncedSearchTextAtom = atom(
  (get) => new LocationsSearchQueryText(get(searchTextAtoms.debouncedValueAtom))
)
