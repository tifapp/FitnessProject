import { Geo, Place } from "@aws-amplify/geo"
import { NamedLocation } from "@location/NamedLocation"
import {
  RecentLocationAnnotation,
  RecentLocationsStorage
} from "@location/Recents"
import {
  LocationCoordinate2D,
  areCoordinatesEqual
} from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * An result that is displayed by the location search.
 */
export type LocationSearchResult = {
  /**
   * The actual location presented by this option.
   */
  location: NamedLocation

  /**
   * An annotation that appears above this option.
   */
  annotation?: RecentLocationAnnotation

  /**
   * True if the option is a saved location in the user's
   * recent locations.
   */
  isRecentLocation: boolean
}

/**
 * A type that denotes whether searching for locations should utilize the user's
 * recent locations, or a remote service.
 */
export type LocationsSearchSourceType = "user-recents" | "remote-search"

/**
 * A rich query type that carries user-entered text for searching locations.
 */
export class LocationsSearchQueryText {
  /**
   * A {@link LocationsSearchQueryText} that is initialized with an empty string.
   */
  static empty = new LocationsSearchQueryText("")

  private readonly rawValue: string

  constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * The data source type of this query. An empty string means loading from
   * the user's recent locations.
   */
  get sourceType(): LocationsSearchSourceType {
    return this.rawValue.length === 0 ? "user-recents" : "remote-search"
  }

  toString() {
    return this.rawValue
  }
}

/**
 * A top-level function that allows a location search, and gives location data
 * regarding the query and the designated center.
 *
 * Uses either {@link searchRecentLocations}, if querying for the user's
 * current recent locations OR uses {@link searchWithRecentAnnotations}, along
 * with the given query and center, if querying for locations in a different
 * location.
 *
 * @param query A {@link LocationsSearchQueryText} given for the search function to use.
 * @param center An optional {@link LocationCoordinate2D} that designates where the location search is occurring from.
 * @returns A Promise of an array of {@link LocationSearchResult}s, or usable data given from the search client.
 */
export const locationSearch = async (
  query: LocationsSearchQueryText,
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
 * Returns a list of {@link NamedLocation}s from AWS Geo using the specified
 * query and center coordinate.
 */
export const awsLocationSearch = async (
  query: LocationsSearchQueryText,
  center: LocationCoordinate2D | undefined,
  awsSearch: typeof Geo.searchByText = Geo.searchByText
): Promise<NamedLocation[]> => {
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
 * `searchFunction` to obtain {@link NamedLocation}s, and
 * {@link RecentLocationsStorage} on their coordinates to obtain async
 * storage's information on whether those locations are recent.
 * This involves combining the data from both processes.
 *
 * @param query A {@link LocationsSearchQueryText} given for the search function to use.
 * @param searchFunction A function that takes in a query + an optional center, then converts the data into a usable set of {@link NamedLocation}s.
 * @param center An optional {@link LocationCoordinate2D} given for the search to center in where it should be searching.
 * @returns A Promise of an array of {@link LocationSearchResult}s.
 */

export const searchWithRecentAnnotations = async (
  query: LocationsSearchQueryText,
  center: LocationCoordinate2D | undefined,
  recents: Pick<RecentLocationsStorage, "locationsForCoordinates">,
  searchFunction: (
    query: LocationsSearchQueryText,
    center?: LocationCoordinate2D
  ) => Promise<NamedLocation[]>
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
