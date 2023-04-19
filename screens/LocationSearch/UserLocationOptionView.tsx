import React from "react"
import { Headline } from "@components/Text"
import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { LocationCoordinate2D, Location } from "@lib/location"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native"
import { Ionicon } from "@components/common/Icons"
import Animated, { FadeIn } from "react-native-reanimated"

export type LocationSearchUserLocationOptionProps = {
  onSelected: (selection: Location) => void
  coordinates: LocationCoordinate2D
  style?: StyleProp<ViewStyle>
}

/**
 * Displays a selectable option that represents the user's current
 * location in the location search ui.
 *
 * When this is selected, the user's location is reverse geocoded which may
 * introduce a slight delay.
 */
export const LocationSearchUserLocationOptionView = ({
  onSelected,
  coordinates,
  style
}: LocationSearchUserLocationOptionProps) => {
  const { refetch } = useReverseGeocodeQuery(coordinates, { isEnabled: false })

  const optionTapped = async () => {
    const reverseGeocodedLocation = await refetch()
    if (reverseGeocodedLocation.status !== "success") {
      onSelected({ coordinates, placemark: {} })
    } else {
      onSelected(reverseGeocodedLocation.data)
    }
  }

  return (
    <TouchableOpacity style={style} onPress={() => optionTapped()}>
      <Animated.View entering={FadeIn} style={styles.container}>
        <Ionicon name="navigate" style={styles.icon} />
        <Headline>Use current location</Headline>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row"
  },
  icon: {
    marginRight: 8
  }
})
