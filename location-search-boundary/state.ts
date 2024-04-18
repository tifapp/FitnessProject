import { useAtomValue } from "jotai"
import { debounceAtomGroup } from "@lib/Jotai"
import { LocationsSearchQueryText } from "./SearchClient"

export const searchTextAtoms = debounceAtomGroup("", 200)

export const useLocationsSearchQueryTextObject = () => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  return new LocationsSearchQueryText(debouncedSearchText)
}
