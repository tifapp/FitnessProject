import React, { ReactNode } from "react"
import { Caption } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import {
  LocationCoordinate2D,
  milesBetweenLocations,
  Location
} from "@lib/location"
import { useAtomValue } from "jotai"
import { FlatList, View } from "react-native"
import { useQuery } from "react-query"
import { LocationSearchDependencyKeys } from "./OptionData"
import {
  LocationSearchOptionProps,
  LocationSearchOptionView
} from "./OptionView"
import { searchTextAtom } from "./state"

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
