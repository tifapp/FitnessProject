import { LocationSearchResult } from "./SearchClient"

/**
 * Result data for the location search picker.
 */
export type LocationSearchLoadingResult =
  | {
      status: "pending"
      data: undefined
    }
  | { status: "no-results"; data: [] }
  | { status: "error"; data: undefined }
  | { status: "success"; data: LocationSearchResult[] }
