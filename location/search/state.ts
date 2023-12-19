import { JotaiUtils } from "@lib/utils/Jotai"
import { useAtomValue } from "jotai"
import { LocationsSearchQuery } from "./Models"

export const searchTextAtoms = JotaiUtils.debounceAtomGroup("", 200)

export const useLocationsSearchQueryObject = () => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  return new LocationsSearchQuery(debouncedSearchText)
}
