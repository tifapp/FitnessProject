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
   * Enables scrolling if true (default: true)
   */
  canScroll?: boolean

  /**
   * Enables zooming if true (default: true)
   */
  canZoom?: boolean

  /**
   * Enables rotating if true (default: true)
   */
  canRotate?: boolean

  /**
   * Renders a replacement for a singular map marker that was passed in through `markers`.
   */
  renderMarker?: (marker: T) => React.ReactNode
}

export const MapSnippet = function Map<T extends EventMarker> ({
  initialRegion,
  marker,
  renderMarker,
  style,
  canScroll = false,
  canRotate = false,
  canZoom = false
}: MapProps<T>) {
  return (
    <MapView
      style={style}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      rotateEnabled={canRotate}
      scrollEnabled={canScroll}
      loadingEnabled={true}
      toolbarEnabled={false}
      zoomEnabled={canZoom}
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
      {
        <>
          <Marker
            key={marker.key}
            coordinate={{
              latitude: marker.location.latitude,
              longitude: marker.location.longitude
            }}
          >
            {renderMarker && renderMarker(marker)}
          </Marker>
        </>
      }
    </MapView>
  )
}

export default MapSnippet
