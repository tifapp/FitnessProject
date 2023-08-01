import React, { ReactElement } from "react"
import { Caption, CaptionTitle } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import {
  LocationCoordinate2D,
  LocationSearchResult,
  LocationsSearchQuery,
  hashLocationCoordinate,
  milesBetweenLocations
} from "@lib/location"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useQuery } from "react-query"
import { LocationSearchDependencyKeys } from "./Data"
import { useLocationsSearchQueryObject } from "./state"
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view"
import { SkeletonView } from "@components/common/Skeleton"
import { Divider } from "react-native-elements"
import { useFontScale } from "@hooks/Fonts"
import {
  LocationSearchResultProps,
  LocationSearchResultView
} from "./SearchResultView"

export type LocationSearchResultsListProps = {
  center?: LocationCoordinate2D
  header?: ReactElement
  SearchResultView?: (props: LocationSearchResultProps) => ReactElement
  style?: StyleProp<ViewStyle>
}

/**
 * Renders a list of location search results.
 *
 * This component uses the search text that can be edited by {@link LocationSearchBar}.
 * When the search text is empty, the user's recent locations will be loaded.
 */
export const LocationSearchResultsListView = ({
  center,
  header,
  style,
  SearchResultView = LocationSearchResultView
}: LocationSearchResultsListProps) => {
  const query = useLocationsSearchQueryObject()
  const { status, data } = useLocationSearchResultsQuery(query, center)
  const fontScale = useFontScale()
  return (
    <KeyboardAwareFlatList
      style={style}
      keyExtractor={extractKeyFromOption}
      ItemSeparatorComponent={() => (
        <View style={styles.separator}>
          <Divider style={{ ...styles.divider, marginLeft: 48 * fontScale }} />
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.horizontalPadding}>
          <View>{header}</View>
          <CaptionTitle style={style}>
            {query.sourceType === "user-recents" ? "Recents" : "Results"}
          </CaptionTitle>
        </View>
      }
      renderItem={({ item }) => (
        <SearchResultView
          result={item}
          distanceMiles={
            center
              ? milesBetweenLocations(center, item.location.coordinates)
              : undefined
          }
          style={styles.horizontalPadding}
        />
      )}
      data={data ?? []}
      ListEmptyComponent={
        <EmptyResultsView
          reason={emptyReasonFromQueryStatus(status)}
          style={styles.horizontalPadding}
        />
      }
    />
  )
}

const extractKeyFromOption = (option: LocationSearchResult) => {
  return hashLocationCoordinate(option.location.coordinates)
}

const useLocationSearchResultsQuery = (
  query: LocationsSearchQuery,
  center?: LocationCoordinate2D
) => {
  const search = useDependencyValue(
    LocationSearchDependencyKeys.searchForResults
  )
  return useQuery(
    ["search-locations", query, center],
    async () => await search(query, center)
  )
}

type EmptyResultsReason = "no-results" | "error" | "loading"

type EmptyResultsProps = {
  reason: EmptyResultsReason
  style?: StyleProp<ViewStyle>
}

const emptyReasonFromQueryStatus = (
  status: "idle" | "success" | "loading" | "error"
): EmptyResultsReason => {
  if (status === "success" || status === "idle") return "no-results"
  if (status === "loading") return "loading"
  return "error"
}

const EmptyResultsView = ({ reason, style }: EmptyResultsProps) => {
  const query = useLocationsSearchQueryObject()
  const noResultsText =
    query.sourceType === "user-recents"
      ? "No recent locations. Locations of events that you host and attend will appear here."
      : `Sorry, no results found for "${query}".`
  return (
    <View style={style}>
      {reason === "error" && (
        <Caption>
          Something went wrong, please check your internet connection and try
          again later.
        </Caption>
      )}
      {reason === "loading" && (
        <View testID="loading-location-options">
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
        </View>
      )}
      {reason === "no-results" && <Caption>{noResultsText}</Caption>}
    </View>
  )
}

const SkeletonResult = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonView style={styles.skeletonIcon} />
    <View>
      <SkeletonView style={styles.skeletionHeadline} />
      <SkeletonView style={styles.skeletonCaption} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  separator: {
    marginVertical: 16,
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  divider: {
    marginLeft: 32,
    width: "100%"
  },
  searchResultsTitle: {
    opacity: 0.35,
    marginBottom: 16
  },
  skeletonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8
  },
  skeletionHeadline: {
    width: 128,
    height: 16,
    marginBottom: 4,
    borderRadius: 12
  },
  skeletonCaption: {
    width: 256,
    height: 12,
    borderRadius: 12
  },
  horizontalPadding: {
    paddingHorizontal: 16
  }
})
