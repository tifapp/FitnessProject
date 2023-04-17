import React, { ReactNode } from "react"
import {
  LocationCoordinate2D,
  Location,
  mockLocation,
  milesBetweenLocations
} from "@lib/location"
import {
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native"
import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { Caption, Headline } from "@components/Text"
import { SearchBar } from "@components/SearchBar"
import { useAtom, useAtomValue } from "jotai"
import { createDependencyKey, useDependencyValue } from "@lib/dependencies"
import { useQuery } from "react-query"
import { atomWithDebounce } from "@lib/Jotai"
import { randomBool } from "@lib/Random"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"

export type LocationSearchAnnotation = "attended-recently" | "hosted-recently"

export const mockLocationSearchAnnotation = (): LocationSearchAnnotation => {
  return randomBool() ? "hosted-recently" : "hosted-recently"
}

export type LocationSearchOption = {
  location: Location
  annotation?: LocationSearchAnnotation
  isRecentLocation: boolean
}

export const mockLocationSearchOption = (): LocationSearchOption => ({
  location: mockLocation(),
  annotation: mockLocationSearchAnnotation(),
  isRecentLocation: randomBool()
})

export type SaveLocationSearchSelection = (selection: Location) => void

export type LoadLocationSearchOptions = (
  query: string,
  center?: LocationCoordinate2D
) => Promise<LocationSearchOption[]>

export namespace LocationSearchDependencyKeys {
  // TODO: - Live Value
  export const saveSelection =
    createDependencyKey<SaveLocationSearchSelection>()

  // TODO: - Live Value
  export const loadOptions = createDependencyKey<LoadLocationSearchOptions>()
}

const searchTextAtom = atomWithDebounce("", 100)

export type LocationSearchOptionProps = {
  option: LocationSearchOption
  distanceMiles?: number
  onSelected: (location: Location) => void
}

export const LocationSearchOptionView = ({
  option,
  distanceMiles,
  onSelected
}: LocationSearchOptionProps) => {
  const save = useDependencyValue(LocationSearchDependencyKeys.saveSelection)
  return (
    <TouchableHighlight
      onPress={() => {
        onSelected(option.location)
        save(option.location)
      }}
    >
      <Headline>{option.location.placemark.name}</Headline>
    </TouchableHighlight>
  )
}

export type HeaderLocationSearchBarProps = {
  onBackTapped: () => void
  placeholder: string
}

export const LocationSearchHeaderSearchBar = ({
  onBackTapped,
  placeholder
}: HeaderLocationSearchBarProps) => {
  const [searchText, setSearchText] = useAtom(searchTextAtom)
  return (
    <SearchBar
      placeholder={placeholder}
      leftAddon={
        <TouchableOpacity onPress={onBackTapped} accessibilityLabel="Go back">
          <View />
        </TouchableOpacity>
      }
      text={searchText}
      onTextChanged={setSearchText}
    />
  )
}

export type LocationSearchUserCoordinatesOptionProps = {
  onSelected: (selection: Location) => void
  coordinates: LocationCoordinate2D
}

export const LocationSearchUserCoordinatesOption = ({
  onSelected,
  coordinates
}: LocationSearchUserCoordinatesOptionProps) => {
  const { refetch } = useReverseGeocodeQuery(coordinates, { isEnabled: false })

  const optionTapped = async () => {
    const reverseGeocodedLocation = await refetch()
    if (reverseGeocodedLocation.status !== "success") {
      onSelected({ coordinates, placemark: {} })
    } else {
      onSelected(reverseGeocodedLocation.data)
    }
  }

  return (
    <TouchableHighlight onPress={() => optionTapped()}>
      <Headline>Use current location</Headline>
    </TouchableHighlight>
  )
}

export type LocationSearchOptionsFlatListProps = {
  center?: LocationCoordinate2D
  renderOption: (props: LocationSearchOptionProps) => ReactNode
  onLocationSelected: (location: Location) => void
}

export const LocationSearchOptionsFlatList = ({
  center,
  renderOption,
  onLocationSelected
}: LocationSearchOptionsFlatListProps) => {
  const { status, data } = useLocationSearchOptionsQuery(center)
  return (
    <FlatList
      renderItem={({ item: option }) => (
        <>
          {renderOption({
            option,
            distanceMiles: center
              ? milesBetweenLocations(center, option.location.coordinates)
              : undefined,
            onSelected: onLocationSelected
          })}
        </>
      )}
      data={data ?? []}
      ListEmptyComponent={
        <EmptyOptionsView reason={emptyReasonFromQueryStatus(status)} />
      }
    />
  )
}

type EmptyOptionsProps = {
  reason: "no-results" | "error" | "loading"
}

const emptyReasonFromQueryStatus = (
  status: "idle" | "success" | "loading" | "error"
) => {
  if (status === "success" || status === "idle") return "no-results"
  if (status === "loading") return "loading"
  return "error"
}

const EmptyOptionsView = ({ reason }: EmptyOptionsProps) => {
  const searchText = useAtomValue(searchTextAtom)
  return (
    <>
      {reason === "error" && (
        <Caption>
          Something went wrong, please check your internet connection and try
          again later.
        </Caption>
      )}
      {reason === "no-results" && searchText.length === 0
        ? (
          <Caption>
          No recent locations. Locations of events that you host and attend will
          appear here.
          </Caption>
        )
        : (
          <Caption>Sorry, no results found for {`"${searchText}"`}.</Caption>
        )}
      {reason === "loading" && <LoadingOptionsView />}
    </>
  )
}

const LoadingOptionsView = () => <View testID="loading-location-options" />

const useLocationSearchOptionsQuery = (center?: LocationCoordinate2D) => {
  const query = useAtomValue(searchTextAtom)
  const loadOptions = useDependencyValue(
    LocationSearchDependencyKeys.loadOptions
  )
  return useQuery(
    ["search-locations", query, center],
    async () => await loadOptions(query, center)
  )
}

export type LocationSearchFromUserLocationProps = {
  renderUserLocationOption: (
    props: LocationSearchUserCoordinatesOptionProps
  ) => ReactNode
  onLocationSelected: (selection: Location) => void
}

export const LocationSearchFromUserLocation = ({
  renderUserLocationOption,
  onLocationSelected
}: LocationSearchFromUserLocationProps) => {
  const { data } = useUserCoordinatesQuery("precise")
  if (!data) return null
  return (
    <>
      {renderUserLocationOption({
        coordinates: data.coordinates,
        onSelected: onLocationSelected
      })}
    </>
  )
}
