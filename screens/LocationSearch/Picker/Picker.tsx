import React from "react"
import { Location, TrackedLocationCoordinates } from "@lib/location"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import { LocationSearchPickerOptionsListView } from "./OptionsList"
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
  return (
    <View style={style}>
      <LocationSearchPickerOptionsListView
        center={data?.coordinates}
        header={
          <>
            {!!data && (
              <UserCoordinatesOptionView
                coordinates={data}
                onSelected={onUserCoordinatesSelected}
                style={styles.header}
              />
            )}
          </>
        }
        onLocationSelected={onLocationSelected}
      />
    </View>
  )
}

type UserCoordinatesOptionProps = {
  onSelected: (coordinates: TrackedLocationCoordinates) => void
  coordinates: TrackedLocationCoordinates
  style?: StyleProp<ViewStyle>
}

const UserCoordinatesOptionView = ({
  onSelected,
  coordinates,
  style
}: UserCoordinatesOptionProps) => {
  return (
    <TouchableOpacity style={style} onPress={() => onSelected(coordinates)}>
      <Animated.View entering={FadeIn} style={styles.userCoordinatesOption}>
        <Ionicon name="navigate" style={styles.userCoordinatesIcon} />
        <Headline>Use current location</Headline>
      </Animated.View>
    </TouchableOpacity>
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
