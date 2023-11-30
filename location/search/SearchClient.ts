import { ArrayUtils } from "@lib/utils/Array"

import { LocationSearchResult, LocationsSearchQuery } from "./Models"

import { Geo, Place } from "@aws-amplify/geo"
import {
  LocationCoordinate2D,
  TiFLocation,
  checkIfCoordsAreEqual
} from "@location/index"
import {
  asyncStorageLoadRecentLocations,
  asyncStorageLoadSpecificRecentLocations
} from "./RecentsStorage"

/**
 * A top-level function that allows a location search, and gives location   data regarding the query and the designated
 * center.
 *
 * Uses either {@link searchRecentLocations}, if querying for the user's current recent locations OR
 * uses {@link searchWithRecentAnnotations}, along with the given query and center, if querying for
 * locations in a different location.
 *
 * @param query A {@link LocationsSearchQuery} given for the search function to use.
 * @param center An optional {@link LocationCoordinate2D} that designates where the location search is occurring from.
 * @returns A Promise of an array of {@link LocationSearchResult}s, or usable data given from the search client.
 */
export const locationSearch = async (
  query: LocationsSearchQuery,
  center?: LocationCoordinate2D
): Promise<LocationSearchResult[]> => {
  if (query.sourceType === "user-recents") return await searchRecentLocations()
  else {
    return await searchWithRecentAnnotations(
      query,
      center,
      awsGeoSearchLocations
    )
  }
}

/**
 *  A function that converts a {@link Place} into a {@link TiFLocation}.
 *
 * @param place A given {@link Place} from Geo.searchByText.
 * @returns The parameter converted into a {@link TiFLocation}.
 */
export const awsPlaceToTifLocation = (place: Place) => {
  if (!place.geometry) return undefined
  return {
    coordinates: {
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
}

/**
 * A function that takes in a query, and uses a search function to obtain results, then converts the data
 * into a usable set of {@link TiFLocation}s.
 *
 * @param query A {@link LocationsSearchQuery} given for the search function to use.
 * @param center An optional {@link LocationCoordinate2D} given for the search to center in where it should be searching.
 * @returns A Promise of an array of {@link TiFLocation}s.
 */
export const awsGeoSearchLocations = async (
  query: LocationsSearchQuery,
  center?: LocationCoordinate2D
) => {
  const options = {
    maxResults: 10,
    biasPosition: center
  }
  const geoSearchResults = await Geo.searchByText(query.toString(), options)
  return ArrayUtils.compactMap(geoSearchResults, awsPlaceToTifLocation)
}

/**
 * A function that pulls the 10 most recent locations stored in AsyncStorage, and maps out their data
 * into a set of {@link LocationSearchResult}s.
 * @returns A Promise of an array of {@link LocationSearchResult}s.
 */
export const searchRecentLocations = (): Promise<LocationSearchResult[]> => {
  return asyncStorageLoadRecentLocations(10).then((results) =>
    results.map((area) => ({ ...area, isRecentLocation: true }))
  )
}

/**
 * A function that uses a provided query, with both its provided searchFunction to obtain {@link TiFLocation}s,
 * and {@link asyncStorageLoadSpecificRecentLocations} on their coordinates to obtain async storage's information
 * on whether those locations are recent.
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
  searchFunction: (
    query: LocationsSearchQuery,
    center?: LocationCoordinate2D
  ) => Promise<TiFLocation[]>
): Promise<LocationSearchResult[]> => {
  const remoteSearchResults = await searchFunction(query, center)
  const searchCoordinates = remoteSearchResults.map(
    (point) => point.coordinates
  ) as LocationCoordinate2D[]
  const asyncRecentSearchResults =
    await asyncStorageLoadSpecificRecentLocations(searchCoordinates)
  const mergedResults = remoteSearchResults.map((remoteSearchPoint) => {
    const checkRecentsForMatch = asyncRecentSearchResults.find((asyncPoint) =>
      checkIfCoordsAreEqual(
        asyncPoint.location.coordinates,
        remoteSearchPoint.coordinates
      )
    )
    return {
      location: remoteSearchPoint,
      annotation: checkRecentsForMatch?.annotation,
      isRecentLocation: !!checkRecentsForMatch?.annotation
    }
  })

  return mergedResults
}
