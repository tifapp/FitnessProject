import React from "react"
import { TiFLocation } from "@lib/location"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import { LocationSearchResultsListView } from "./SearchResultsList"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { Ionicon } from "@components/common/Icons"
import { Headline } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import { LocationSearchDependencyKeys } from "./Data"
import {
  LocationSearchResultProps,
  LocationSearchResultView
} from "./SearchResultView"
import { LocationAccuracy, LocationObject } from "expo-location"

export type LocationSearchPickerProps = {
  onUserLocationSelected: (location: LocationObject) => void
  onLocationSelected: (selection: TiFLocation) => void
  SearchResultView?: (props: LocationSearchResultProps) => JSX.Element
  style?: StyleProp<ViewStyle>
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
  onUserLocationSelected,
  onLocationSelected,
  SearchResultView = LocationSearchResultView,
  style
}: LocationSearchPickerProps) => {
  const { data } = useUserCoordinatesQuery({ accuracy: LocationAccuracy.Low })
  const saveSelection = useDependencyValue(
    LocationSearchDependencyKeys.savePickerSelection
  )
  return (
    <LocationSearchResultsListView
      style={style}
      center={data?.coords}
      header={
        <>
          {!!data && (
            <TouchableOpacity
              style={style}
              onPress={() => onUserLocationSelected(data)}
            >
              <Animated.View
                entering={FadeIn}
                style={styles.userCoordinatesOption}
              >
                <Ionicon name="navigate" style={styles.userCoordinatesIcon} />
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
            saveSelection(props.result.location)
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
    flexDirection: "row"
  },
  userCoordinatesIcon: {
    marginRight: 8
  }
})
