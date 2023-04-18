import React, { ReactNode } from "react"
import { Location } from "@lib/location"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import {
  LocationSearchOptionsListProps,
  LocationSearchOptionsListView
} from "./OptionsList"
import {
  LocationSearchUserLocationOptionProps,
  LocationSearchUserLocationOptionView
} from "./UserLocationOptionView"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type LocationSearchPickerProps = {
  renderUserLocationOption?: (
    props: LocationSearchUserLocationOptionProps
  ) => ReactNode
  renderOptionsList?: (props: LocationSearchOptionsListProps) => ReactNode
  onLocationSelected: (selection: Location) => void
  style?: StyleProp<ViewStyle>
}

/**
 * Renders the location search UI involved with picking a location from
 * a list of options.
 */
export const LocationSearchPicker = ({
  renderUserLocationOption = LocationSearchUserLocationOptionView,
  renderOptionsList = LocationSearchOptionsListView,
  onLocationSelected,
  style
}: LocationSearchPickerProps) => {
  const { data } = useUserCoordinatesQuery("precise")
  return (
    <View style={style}>
      <LocationSearchOptionsListView
        center={data?.coordinates}
        header={
          <>
            {data?.coordinates && (
              <LocationSearchUserLocationOptionView
                coordinates={data.coordinates}
                onSelected={onLocationSelected}
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

const styles = StyleSheet.create({
  header: {
    marginBottom: 24
  }
})
