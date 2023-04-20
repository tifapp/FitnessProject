import React, { ReactElement } from "react"
import { Caption, CaptionTitle } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import { LocationCoordinate2D, milesBetweenLocations } from "@lib/location"
import { useAtomValue } from "jotai"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useQuery } from "react-query"
import { LocationSearchDependencyKeys, LocationSearchResult } from "./Data"
import { searchTextAtoms } from "./state"
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view"
import { SkeletonView } from "@components/common/Skeleton"
import { Divider } from "react-native-elements"
import { useFontScale } from "@hooks/Fonts"

export type LocationSearchResultsListProps = {
  center?: LocationCoordinate2D
  header?: ReactElement
  renderSearchResult: (
    result: LocationSearchResult,
    milesFromCenter?: number
  ) => ReactElement
  style?: StyleProp<ViewStyle>
}

/**
 * Renders the current list of options that the user can pick from the
 * location search ui.
 */
export const LocationSearchResultsListView = ({
  center,
  header,
  style,
  renderSearchResult
}: LocationSearchResultsListProps) => {
  const { status, data } = useLocationSearchOptionsQuery(center)
  const fontScale = useFontScale()
  return (
    <KeyboardAwareFlatList
      style={[styles.optionsList, style]}
      keyExtractor={extractKeyFromOption}
      ItemSeparatorComponent={() => (
        <View style={styles.separator}>
          <Divider style={{ ...styles.divider, marginLeft: 48 * fontScale }} />
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.horizontalPadding}>
          <View>{header}</View>
          <OptionsListHeaderTitle style={styles.headerTitle} />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.horizontalPadding}>
          {renderSearchResult(
            item,
            center
              ? milesBetweenLocations(center, item.location.coordinates)
              : undefined
          )}
        </View>
      )}
      data={data ?? []}
      ListEmptyComponent={
        <EmptyOptionsView
          reason={emptyReasonFromQueryStatus(status)}
          style={styles.horizontalPadding}
        />
      }
    />
  )
}

const extractKeyFromOption = (option: LocationSearchResult) => {
  return `${option.location.coordinates.latitude}, ${option.location.coordinates.longitude}`
}

const useLocationSearchOptionsQuery = (center?: LocationCoordinate2D) => {
  const query = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const loadOptions = useDependencyValue(
    LocationSearchDependencyKeys.searchForResults
  )
  return useQuery(
    ["search-locations", query, center],
    async () => await loadOptions(query, center)
  )
}

type OptionsListHeaderTitleProps = {
  style?: StyleProp<ViewStyle>
}

const OptionsListHeaderTitle = ({ style }: OptionsListHeaderTitleProps) => {
  const debouncedSearchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const headerText = debouncedSearchText.length === 0 ? "Recents" : "Results"
  return <CaptionTitle style={style}>{headerText}</CaptionTitle>
}

type EmptyOptionsReason = "no-results" | "error" | "loading"

type EmptyOptionsProps = {
  reason: EmptyOptionsReason
  style?: StyleProp<ViewStyle>
}

const emptyReasonFromQueryStatus = (
  status: "idle" | "success" | "loading" | "error"
): EmptyOptionsReason => {
  if (status === "success" || status === "idle") return "no-results"
  if (status === "loading") return "loading"
  return "error"
}

const EmptyOptionsView = ({ reason, style }: EmptyOptionsProps) => {
  const searchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const noResultsText =
    searchText.length === 0
      ? "No recent locations. Locations of events that you host and attend will appear here."
      : `Sorry, no results found for "${searchText}".`
  return (
    <View style={style}>
      {reason === "error" && (
        <Caption>
          Something went wrong, please check your internet connection and try
          again later.
        </Caption>
      )}
      {reason === "loading" && <LoadingOptionsView />}
      {reason === "no-results" && <Caption>{noResultsText}</Caption>}
    </View>
  )
}

const LoadingOptionsView = () => (
  <View testID="loading-location-options">
    <SkeletonOption />
    <SkeletonOption />
    <SkeletonOption />
    <SkeletonOption />
    <SkeletonOption />
    <SkeletonOption />
    <SkeletonOption />
  </View>
)

const SkeletonOption = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonView style={styles.skeletonIcon} />
    <View>
      <SkeletonView style={styles.skeletionHeadline} />
      <SkeletonView style={styles.skeletonCaption} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  optionsList: {
    height: "100%"
  },
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
  headerTitle: {
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
