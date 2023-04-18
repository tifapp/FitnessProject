import React, { ReactNode } from "react"
import { Caption, CaptionTitle } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import {
  LocationCoordinate2D,
  milesBetweenLocations,
  Location
} from "@lib/location"
import { useAtomValue } from "jotai"
import { StyleSheet, View } from "react-native"
import { useQuery } from "react-query"
import {
  LocationSearchDependencyKeys,
  LocationSearchOption
} from "./OptionData"
import {
  LocationSearchOptionProps,
  LocationSearchOptionView
} from "./OptionView"
import { searchTextAtoms } from "./state"
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view"
import { SkeletonView } from "@components/common/Skeleton"
import { Divider } from "react-native-elements"
import { WithScreenEdgePadding } from "@components/Spacing"

export type LocationSearchOptionsListProps = {
  center?: LocationCoordinate2D
  header?: ReactNode
  renderOption?: (props: LocationSearchOptionProps) => ReactNode
  onLocationSelected: (location: Location) => void
}

const extractKey = (option: LocationSearchOption) => {
  return `${option.location.coordinates.latitude}, ${option.location.coordinates.longitude}`
}

/**
 * Renders the current list of options that the user can pick from the
 * location search ui.
 */
export const LocationSearchOptionsListView = ({
  center,
  header,
  renderOption = LocationSearchOptionView,
  onLocationSelected
}: LocationSearchOptionsListProps) => {
  const { status, data } = useLocationSearchOptionsQuery(center)
  const searchText = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const headerText = searchText.length === 0 ? "Recents" : "Results"
  return (
    <KeyboardAwareFlatList
      style={styles.optionsList}
      keyExtractor={(item) => extractKey(item)}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      ListHeaderComponent={
        <WithScreenEdgePadding>
          <View>{header}</View>
          <CaptionTitle style={styles.headerText}>{headerText}</CaptionTitle>
        </WithScreenEdgePadding>
      }
      renderItem={({ item }) => (
        <WithScreenEdgePadding>
          <LocationSearchOptionView
            option={item}
            distanceMiles={
              center
                ? milesBetweenLocations(center, item.location.coordinates)
                : undefined
            }
            onSelected={onLocationSelected}
          />
        </WithScreenEdgePadding>
      )}
      data={data ?? []}
      ListEmptyComponent={
        <WithScreenEdgePadding>
          <EmptyOptionsView reason={emptyReasonFromQueryStatus(status)} />
        </WithScreenEdgePadding>
      }
    />
  )
}

const useLocationSearchOptionsQuery = (center?: LocationCoordinate2D) => {
  const query = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const loadOptions = useDependencyValue(
    LocationSearchDependencyKeys.loadOptions
  )
  return useQuery(
    ["search-locations", query, center],
    async () => await loadOptions(query, center)
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
  const searchText = useAtomValue(searchTextAtoms.currentValueAtom)
  const noResultsText =
    searchText.length === 0
      ? "No recent locations. Locations of events that you host and attend will appear here."
      : `Sorry, no results found for "${searchText}".`
  return (
    <>
      {reason === "error" && (
        <Caption>
          Something went wrong, please check your internet connection and try
          again later.
        </Caption>
      )}
      {reason === "loading" && <LoadingOptionsView />}
      {reason === "no-results" && <Caption>{noResultsText}</Caption>}
    </>
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
  divider: {
    marginVertical: 16
  },
  headerText: {
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
  option: {
    paddingHorizontal: 16
  }
})
