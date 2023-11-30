import { debounceAtomGroup } from "@lib/Jotai"
import { useAtomValue } from "jotai"
import { LocationsSearchQuery } from "./Models"

export const searchTextAtoms = debounceAtomGroup("", 200)

export const useLocationsSearchQueryObject = () => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  return new LocationsSearchQuery(debouncedSearchText)
}
