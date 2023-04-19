import React, { ReactNode } from "react"
import { Caption, CaptionTitle } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import {
  LocationCoordinate2D,
  milesBetweenLocations,
  Location
} from "@lib/location"
import { useAtomValue } from "jotai"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useQuery } from "react-query"
import {
  LocationSearchPickerDependencyKeys,
  LocationSearchOption
} from "./DataLoading"
import { LocationSearchOptionView } from "./OptionView"
import { searchTextAtoms } from "../state"
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view"
import { SkeletonView } from "@components/common/Skeleton"
import { Divider } from "react-native-elements"

export type LocationSearchOptionsListProps = {
  center?: LocationCoordinate2D
  header?: ReactNode
  onLocationSelected: (location: Location) => void
  style?: StyleProp<ViewStyle>
}

/**
 * Renders the current list of options that the user can pick from the
 * location search ui.
 */
export const LocationSearchPickerOptionsListView = ({
  center,
  header,
  style,
  onLocationSelected
}: LocationSearchOptionsListProps) => {
  const { status, data } = useLocationSearchOptionsQuery(center)
  return (
    <KeyboardAwareFlatList
      style={[styles.optionsList, style]}
      keyExtractor={(item) => extractKeyFromOption(item)}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      ListHeaderComponent={
        <View style={styles.horizontalPadding}>
          <View>{header}</View>
          <OptionsListHeaderTitle style={styles.headerTitle} />
        </View>
      }
      renderItem={({ item }) => (
        <LocationSearchOptionView
          option={item}
          distanceMiles={
            center
              ? milesBetweenLocations(center, item.location.coordinates)
              : undefined
          }
          onSelected={onLocationSelected}
          style={styles.horizontalPadding}
        />
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

const extractKeyFromOption = (option: LocationSearchOption) => {
  return `${option.location.coordinates.latitude}, ${option.location.coordinates.longitude}`
}

const useLocationSearchOptionsQuery = (center?: LocationCoordinate2D) => {
  const query = useAtomValue(searchTextAtoms.debouncedValueAtom)
  const loadOptions = useDependencyValue(
    LocationSearchPickerDependencyKeys.loadOptions
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
  const searchText = useAtomValue(searchTextAtoms.currentValueAtom)
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
  divider: {
    marginVertical: 16
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
