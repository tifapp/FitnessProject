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

/**
 * An annotation that appears above a location search result in the UI.
 */
export type LocationSearchAnnotation = "attended-recently" | "hosted-recently"

/**
 * Creates a random {@link LocationSearchAnnotation}.
 */
export const mockLocationSearchAnnotation = (): LocationSearchAnnotation => {
  return randomBool() ? "hosted-recently" : "hosted-recently"
}

/**
 * An option that is displayed by the location search.
 */
export type LocationSearchOption = {
  /**
   * The actual location presented by this option.
   */
  location: Location

  /**
   * An annotation that appears above this option.
   */
  annotation?: LocationSearchAnnotation

  /**
   * True if the option is a saved location in the user's
   * recent locations.
   */
  isRecentLocation: boolean
}

/**
 * Mocks a {@link LocationSearchOption}.
 */
export const mockLocationSearchOption = (): LocationSearchOption => ({
  location: mockLocation(),
  annotation: mockLocationSearchAnnotation(),
  isRecentLocation: randomBool()
})

/**
 * Saves a search selection made by the user in the location search process.
 */
export type SaveLocationSearchSelection = (selection: Location) => void

/**
 * Loads a set of {@link LocationSearchOption}s for the user to pick from based
 * on a query string and a center bias.
 *
 * If the query string is empty, a list of the user's recent locations will be
 * loaded.
 */
export type LoadLocationSearchOptions = (
  query: string,
  center?: LocationCoordinate2D
) => Promise<LocationSearchOption[]>

/**
 * Some dependency keys used by the location search UI.
 */
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

/**
 * Displays a {@link LocationSearchOption} with a specified distance.
 */
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

export type LocationSearchBarProps = {
  onBackTapped: () => void
  placeholder: string
}

/**
 * A search bar that edits the current location search query.
 */
export const LocationSearchBar = ({
  onBackTapped,
  placeholder
}: LocationSearchBarProps) => {
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

export type LocationSearchOptionsListProps = {
  center?: LocationCoordinate2D
  header?: ReactNode
  renderOption?: (props: LocationSearchOptionProps) => ReactNode
  onLocationSelected: (location: Location) => void
}

/**
 * Renders the current list of options that the user can pick from the
 * location search ui.
 */
export const LocationSearchOptionsListView = ({
  center,
  renderOption = LocationSearchOptionView,
  onLocationSelected
}: LocationSearchOptionsListProps) => {
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

export type LocationSearchUserLocationOptionProps = {
  onSelected: (selection: Location) => void
  coordinates: LocationCoordinate2D
}

/**
 * Displays a selectable option that represents the user's current
 * location in the location search ui.
 *
 * When this is selected, the user's location is reverse geocoded which may
 * introduce a slight delay.
 */
export const LocationSearchUserLocationOptionView = ({
  onSelected,
  coordinates
}: LocationSearchUserLocationOptionProps) => {
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

export type LocationSearchPickerProps = {
  renderUserLocationOption?: (
    props: LocationSearchUserLocationOptionProps
  ) => ReactNode
  renderOptionsList?: (props: LocationSearchOptionsListProps) => ReactNode
  onLocationSelected: (selection: Location) => void
}

/**
 * Renders the location search UI involved with picking a location from
 * a list of options.
 */
export const LocationSearchPicker = ({
  renderUserLocationOption = LocationSearchUserLocationOptionView,
  renderOptionsList = LocationSearchOptionsListView,
  onLocationSelected
}: LocationSearchPickerProps) => {
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
