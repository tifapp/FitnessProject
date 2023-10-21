import { debounceAtomGroup } from "@lib/Jotai"
import { LocationsSearchQuery } from "@lib/location"
import { useAtomValue } from "jotai"

export const searchTextAtoms = debounceAtomGroup("", 200)

export const useLocationsSearchQueryObject = () => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  return new LocationsSearchQuery(debouncedSearchText)
}
