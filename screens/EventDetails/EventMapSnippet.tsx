import { LocationCoordinate2D } from "lib/location/Location"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

/**
 * A type that can be rendered by a {@link EventsMap}.
 */
export interface EventMarker {
  key: string
  location: LocationCoordinate2D
}

export type MapProps<T extends EventMarker> = {
  style?: StyleProp<ViewStyle>

  /**
   * The initial region to center the map on.
   */
  initialRegion: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }

  /**
   * A single map marker to display.
   */
  marker: T

  /**
   * Renders a replacement for a singular map marker that was passed in through `markers`.
   */
  renderMarker?: (marker: T) => React.ReactNode

  /**
   * Sets the minimum/default zoom level for the map
   */
  minZoomLevel?: number
}

export const EventMapSnippet = function Map<T extends EventMarker> ({
  initialRegion,
  marker,
  renderMarker,
  style,
  minZoomLevel
}: MapProps<T>) {
  return (
    <MapView
      style={style}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      rotateEnabled={false}
      scrollEnabled={false}
      loadingEnabled={true}
      toolbarEnabled={false}
      zoomEnabled={false}
      minZoomLevel={minZoomLevel}
      pointerEvents="none"
      customMapStyle={[
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          stylers: [{ visibility: "off" }]
        }
      ]}
    >
      <Marker
        key={marker.key}
        coordinate={{
          latitude: marker.location.latitude,
          longitude: marker.location.longitude
        }}
      >
        {renderMarker?.(marker)}
      </Marker>
    </MapView>
  )
}

export default EventMapSnippet
