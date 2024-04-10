import { useAtomValue } from "jotai"
import { LocationsSearchQuery } from "./Models"
import { debounceAtomGroup } from "@lib/Jotai"

export const searchTextAtoms = debounceAtomGroup("", 200)

export const useLocationsSearchQueryObject = () => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  return new LocationsSearchQuery(debouncedSearchText)
}
