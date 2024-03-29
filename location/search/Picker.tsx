import { Headline } from "@components/Text"
import { CircularIonicon } from "@components/common/Icons"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import { AppStyles } from "@lib/AppColorStyle"
import { LocationCoordinate2D, TiFLocation } from "@location"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { LocationAccuracy, LocationObject } from "expo-location"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { LocationSearchResult, LocationsSearchQuery } from "."
import {
  LocationSearchResultProps,
  LocationSearchResultView
} from "./SearchResultView"
import { LocationSearchResultsListView } from "./SearchResultsList"
import { LocationSearchResultsData } from "./Models"
import { useLocationsSearchQueryObject } from "./state"

export type UseLocationSearchPickerEnvironment = {
  loadSearchResults: (
    query: LocationsSearchQuery,
    center?: LocationCoordinate2D
  ) => Promise<LocationSearchResult[]>
}

/**
 * A hook to provide data to the location search picker.
 */
export const useLocationSearchPicker = ({
  loadSearchResults
}: UseLocationSearchPickerEnvironment) => {
  const query = useLocationsSearchQueryObject()
  const userLocation = useLocationSearchCenter()
  const queryResult = useLocationSearchResultsQuery(
    query,
    userLocation?.coords,
    loadSearchResults
  )
  return {
    userLocation,
    query,
    searchResults: queryResultToDataResult(queryResult)
  }
}

const queryResultToDataResult = ({
  status,
  data
}: UseQueryResult<
  LocationSearchResult[],
  unknown
>): LocationSearchResultsData => {
  if (status === "success" && data.length === 0) {
    return { status: "no-results", data: [] }
  } else if (status === "success") {
    return { status, data }
  } else if (status === "loading") {
    return { status: "loading", data: undefined }
  }
  return { status: "error", data: undefined }
}

const useLocationSearchResultsQuery = (
  query: LocationsSearchQuery,
  center: LocationCoordinate2D | undefined,
  loadSearchResults: (
    query: LocationsSearchQuery,
    center?: LocationCoordinate2D
  ) => Promise<LocationSearchResult[]>
) => {
  return useQuery(
    ["search-locations", query, center],
    async () => await loadSearchResults(query, center)
  )
}

const useLocationSearchCenter = () => {
  return useUserCoordinatesQuery({ accuracy: LocationAccuracy.Low }).data
}

export type LocationSearchPickerProps = {
  query: LocationsSearchQuery
  userLocation?: LocationObject
  searchResults: LocationSearchResultsData
  savePickedLocation: (result: TiFLocation) => void
  onUserLocationSelected: (location: LocationObject) => void
  onLocationSelected: (selection: TiFLocation) => void
  SearchResultView?: (props: LocationSearchResultProps) => JSX.Element
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * Renders the location search UI involved with picking a location from
 * a list of options.
 *
 * This component uses the search text that can be edited by {@link LocationSearchBar}.
 * When the search text is empty, the user's recent locations will be loaded.
 *
 * When an option that is not the user's coordinates is selected, it gets saved to the
 * user's recent locations.
 */
export const LocationSearchPicker = ({
  query,
  searchResults,
  userLocation,
  savePickedLocation,
  onUserLocationSelected,
  onLocationSelected,
  SearchResultView = LocationSearchResultView,
  style,
  contentContainerStyle
}: LocationSearchPickerProps) => (
  <LocationSearchResultsListView
    style={style}
    contentContainerStyle={contentContainerStyle}
    query={query}
    searchResults={searchResults}
    center={userLocation?.coords}
    Header={
      <>
        {userLocation && (
          <TouchableOpacity
            onPress={() => onUserLocationSelected(userLocation)}
          >
            <Animated.View
              entering={FadeIn}
              style={styles.userCoordinatesOption}
            >
              <CircularIonicon
                backgroundColor={AppStyles.linkColor}
                name="navigate"
                accessible={false}
                style={styles.userCoordinatesIcon}
              />
              <Headline>Use current location</Headline>
            </Animated.View>
          </TouchableOpacity>
        )}
      </>
    }
    SearchResultView={(props: LocationSearchResultProps) => (
      <TouchableOpacity
        onPress={() => {
          onLocationSelected(props.result.location)
          savePickedLocation(props.result.location)
        }}
      >
        {<SearchResultView {...props} />}
      </TouchableOpacity>
    )}
  />
)

const styles = StyleSheet.create({
  header: {
    marginBottom: 24
  },
  userCoordinatesOption: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  userCoordinatesIcon: {
    marginRight: 8
  }
})
