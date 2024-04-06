import { LocationSearchResult, LocationsSearchQuery } from "./Models"
import { Geo, Place } from "@aws-amplify/geo"
import { TiFLocation } from "@location/index"
import { RecentLocationsStorage } from "@lib/RecentsLocations"
import {
  LocationCoordinate2D,
  areCoordinatesEqual
} from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * A top-level function that allows a location search, and gives location data
 * regarding the query and the designated center.
 *
 * Uses either {@link searchRecentLocations}, if querying for the user's
 * current recent locations OR uses {@link searchWithRecentAnnotations}, along
 * with the given query and center, if querying for locations in a different
 * location.
 *
 * @param query A {@link LocationsSearchQuery} given for the search function to use.
 * @param center An optional {@link LocationCoordinate2D} that designates where the location search is occurring from.
 * @returns A Promise of an array of {@link LocationSearchResult}s, or usable data given from the search client.
 */
export const locationSearch = async (
  query: LocationsSearchQuery,
  center: LocationCoordinate2D | undefined,
  storage: Pick<RecentLocationsStorage, "locationsForCoordinates" | "recent">
): Promise<LocationSearchResult[]> => {
  if (query.sourceType === "user-recents") {
    return await searchRecentLocations(storage)
  } else {
    return await searchWithRecentAnnotations(
      query,
      center,
      storage,
      awsLocationSearch
    )
  }
}

/**
 * Returns a list of {@link TiFLocation}s from AWS Geo using the specified
 * query and center coordinate.
 */
export const awsLocationSearch = async (
  query: LocationsSearchQuery,
  center: LocationCoordinate2D | undefined,
  awsSearch: typeof Geo.searchByText = Geo.searchByText
): Promise<TiFLocation[]> => {
  const results = await awsSearch(query.toString(), {
    maxResults: 10,
    biasPosition: center ? [center.longitude, center.latitude] : undefined
  })
  return results.ext.compactMap((place: Place) => {
    if (!place.geometry) return undefined
    return {
      coordinate: {
        latitude: place.geometry.point[1],
        longitude: place.geometry.point[0]
      },
      placemark: {
        name: place.label?.split(", ", 1)[0],
        country: place.country,
        postalCode: place.postalCode,
        street: place.street,
        streetNumber: place.addressNumber,
        region: place.region,
        isoCountryCode: "US",
        city: place.municipality
      }
    }
  })
}

/**
 * A function that pulls the 10 most recent locations stored in a given
 * instance of {@link RecentLocationsStorage}, and maps out their data
 * into a set of {@link LocationSearchResult}s.
 *
 * @returns A Promise of an array of {@link LocationSearchResult}s.
 */
export const searchRecentLocations = async (
  storage: Pick<RecentLocationsStorage, "recent">
): Promise<LocationSearchResult[]> => {
  return await storage.recent(10).then((results) => {
    return results.map((area) => ({ ...area, isRecentLocation: true }))
  })
}

/**
 * A function that uses a provided query, with both its provided
 * `searchFunction` to obtain {@link TiFLocation}s, and
 * {@link RecentLocationsStorage} on their coordinates to obtain async
 * storage's information on whether those locations are recent.
 * This involves combining the data from both processes.
 *
 * @param query A {@link LocationsSearchQuery} given for the search function to use.
 * @param searchFunction A function that takes in a query + an optional center, then converts the data into a usable set of {@link TiFLocation}s.
 * @param center An optional {@link LocationCoordinate2D} given for the search to center in where it should be searching.
 * @returns A Promise of an array of {@link LocationSearchResult}s.
 */

export const searchWithRecentAnnotations = async (
  query: LocationsSearchQuery,
  center: LocationCoordinate2D | undefined,
  recents: Pick<RecentLocationsStorage, "locationsForCoordinates">,
  searchFunction: (
    query: LocationsSearchQuery,
    center?: LocationCoordinate2D
  ) => Promise<TiFLocation[]>
): Promise<LocationSearchResult[]> => {
  const remoteSearchResults = await searchFunction(query, center)
  const searchCoordinates = remoteSearchResults.map((point) => point.coordinate)
  const recentLocations =
    await recents.locationsForCoordinates(searchCoordinates)
  const mergedResults = remoteSearchResults.map((remoteSearchPoint) => {
    const recentLocation = recentLocations.find((asyncPoint) => {
      return areCoordinatesEqual(
        asyncPoint.location.coordinate,
        remoteSearchPoint.coordinate
      )
    })
    return {
      location: remoteSearchPoint,
      annotation: recentLocation?.annotation,
      isRecentLocation: !!recentLocation
    }
  })
  return mergedResults
}
