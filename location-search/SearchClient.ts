import { ArrayUtils } from "@lib/Array"

import { LocationSearchResult, LocationsSearchQuery } from "./models"

import { Geo, Place } from "@aws-amplify/geo"
import { LocationCoordinate2D, TiFLocation } from "@lib/location"
import {
  asyncStorageLoadRecentLocations,
  asyncStorageLoadSpecificRecentLocations
} from "./RecentsStorage"

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

export const awsGeoSearchLocations = async (query: LocationsSearchQuery) => {
  const geoSearchResults = await Geo.searchByText(query.toString())
  return ArrayUtils.compactMap(geoSearchResults, awsPlaceToTifLocation)
}

export const searchRecentLocations = (): Promise<LocationSearchResult[]> => {
  return asyncStorageLoadRecentLocations(10).then((results) =>
    results.map((area) => ({ ...area, isRecentLocation: true }))
  )
}

export const searchWithRecentAnnotations = async (
  query: LocationsSearchQuery,
  searchFunction: (query: LocationsSearchQuery) => Promise<TiFLocation[]>
): Promise<LocationSearchResult[]> => {
  const results = await searchFunction(query)
  const coordinates = results.map(
    (point) => point.coordinates
  ) as LocationCoordinate2D[]
  const finishedResults = await asyncStorageLoadSpecificRecentLocations(
    coordinates
  )
  return finishedResults.map((point) => ({
    location: point.location,
    annotation: point.annotation,
    isRecentLocation: true
  }))
}
