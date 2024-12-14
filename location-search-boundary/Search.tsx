import { Headline } from "@components/Text"
import { CircularIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { NamedLocation } from "@location/NamedLocation"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { LocationAccuracy, LocationObject } from "expo-location"
import React, { ReactNode, createContext, useContext, useState } from "react"
import {
  LayoutRectangle,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { LocationSearchLoadingResult } from "./LoadingResult"
import {
  LocationSearchResult,
  LocationsSearchQueryText,
  locationSearch
} from "./SearchClient"
import {
  LocationSearchResultProps,
  LocationSearchResultView
} from "./SearchResultView"
import { LocationSearchResultsListView } from "./SearchResultsList"
import { debouncedSearchTextAtom } from "./SearchTextAtoms"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { useAtomValue } from "jotai"
import { useScreenBottomPadding } from "@components/Padding"
import { useNavigation } from "@react-navigation/native"
import { LocationSearchBar } from "./SearchBar"
import { SafeAreaView } from "react-native-safe-area-context"
import { logger } from "TiFShared/logging"
import { recentLocationsStorage } from "@location/Recents"

export type LocationsSearchContextValues = {
  searchResults: (
    query: LocationsSearchQueryText,
    center?: LocationCoordinate2D
  ) => Promise<LocationSearchResult[]>
  saveLocation: (result: NamedLocation) => void
}

const log = logger("location.search")

const LocationsSearchContext = createContext<LocationsSearchContextValues>({
  searchResults: locationSearch,
  saveLocation: async (result) => {
    try {
      await recentLocationsStorage.save(result)
    } catch (e) {
      log.error("Failed to save location.", { error: e, location: result })
    }
  }
})

export type LocationsSearchProviderProps =
  Partial<LocationsSearchContextValues> & {
    children: ReactNode
  }

export const LocationsSearchProvider = ({
  children,
  ...values
}: LocationsSearchProviderProps) => (
  <LocationsSearchContext.Provider
    value={mergeWithPartial(useContext(LocationsSearchContext), values)}
  >
    {children}
  </LocationsSearchContext.Provider>
)

/**
 * A hook to provide data to the location search picker.
 */
export const useLocationsSearch = () => {
  const query = useAtomValue(debouncedSearchTextAtom)
  const { searchResults } = useContext(LocationsSearchContext)
  const userLocation = useLocationSearchCenter()
  const locationsQuery = useQuery(
    ["search-locations", query, userLocation?.coords],
    async () => await searchResults(query, userLocation?.coords)
  )
  return {
    userLocation,
    query,
    searchResults: queryResultToDataResult(locationsQuery)
  }
}

const queryResultToDataResult = ({
  status,
  data
}: UseQueryResult<
  LocationSearchResult[],
  unknown
>): LocationSearchLoadingResult => {
  if (status === "success" && data.length === 0) {
    return { status: "no-results", data: [] }
  } else if (status === "success") {
    return { status, data }
  } else if (status === "loading") {
    return { status: "loading", data: undefined }
  }
  return { status: "error", data: undefined }
}

const useLocationSearchCenter = () => {
  return useUserCoordinatesQuery({ accuracy: LocationAccuracy.Low }).data
}

export type LocationsSearchProps = {
  state: ReturnType<typeof useLocationsSearch>
  onUserLocationSelected: (location: LocationObject) => void
  onLocationSelected: (selection: NamedLocation) => void
  SearchResultView?: (props: LocationSearchResultProps) => JSX.Element
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

export const LocationsSearchView = ({
  state,
  ...props
}: LocationsSearchProps) => {
  const [headerLayout, setHeaderLayout] = useState<
    LayoutRectangle | undefined
  >()
  const safeAreaEdges =
    Platform.OS === "android" ? undefined : (["bottom"] as const)
  const padding = useScreenBottomPadding({
    safeAreaScreens: (headerLayout?.height ?? 0) + 24,
    nonSafeAreaScreens: 24
  })
  return (
    <SafeAreaView edges={safeAreaEdges}>
      <View onLayout={(e) => setHeaderLayout(e.nativeEvent.layout)}>
        <LocationSearchBar
          onBackTapped={useNavigation().goBack}
          placeholder="Enter a Location"
          style={styles.locationSearchBarHeaderSpacing}
        />
      </View>
      <LocationSearchPicker
        state={state}
        {...props}
        contentContainerStyle={{ paddingBottom: padding }}
      />
    </SafeAreaView>
  )
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
  state: { query, searchResults, userLocation },
  onUserLocationSelected,
  onLocationSelected,
  SearchResultView = LocationSearchResultView,
  style,
  contentContainerStyle
}: LocationsSearchProps) => {
  const { saveLocation } = useContext(LocationsSearchContext)
  return (
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
                  size={24}
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
            saveLocation(props.result.location)
          }}
        >
          {<SearchResultView {...props} />}
        </TouchableOpacity>
      )}
    />
  )
}

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
  },
  locationSearchPicker: { height: "100%", paddingTop: 16 },
  locationSearchBarHeaderSpacing: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8
  }
})
