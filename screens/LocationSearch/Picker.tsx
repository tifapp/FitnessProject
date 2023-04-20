import React from "react"
import { Location, TrackedLocationCoordinates } from "@lib/location"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import { LocationSearchResultsListView } from "./SearchResultsList"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { Ionicon } from "@components/common/Icons"
import { Headline } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import { LocationSearchDependencyKeys } from "./Data"
import { LocationSearchResultView } from "./SearchResultView"

export type LocationSearchPickerProps = {
  onUserCoordinatesSelected: (coordinates: TrackedLocationCoordinates) => void
  onLocationSelected: (selection: Location) => void
  style?: StyleProp<ViewStyle>
}

/**
 * Renders the location search UI involved with picking a location from
 * a list of options.
 */
export const LocationSearchPicker = ({
  onUserCoordinatesSelected,
  onLocationSelected,
  style
}: LocationSearchPickerProps) => {
  const { data } = useUserCoordinatesQuery("approximate-low")
  const saveSelection = useDependencyValue(
    LocationSearchDependencyKeys.savePickerSelection
  )
  return (
    <View style={style}>
      <LocationSearchResultsListView
        center={data?.coordinates}
        header={
          <>
            {!!data && (
              <TouchableOpacity
                style={style}
                onPress={() => onUserCoordinatesSelected(data)}
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
        renderSearchResult={(option, milesFromCenter) => (
          <TouchableOpacity
            onPress={() => {
              onLocationSelected(option.location)
              saveSelection(option.location)
            }}
          >
            <LocationSearchResultView
              option={option}
              distanceMiles={milesFromCenter}
            />
          </TouchableOpacity>
        )}
      />
    </View>
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
