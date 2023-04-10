import { Location } from "lib/location/Location"
import React, { forwardRef, MutableRefObject, useRef } from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

/**
 * A type that can be rendered by a {@link EventsMap}.
 */
export interface MapMarker {
  key: string
  location: Location
}

export type MapBounds = {
  left: Location
  right: Location
  bottom: Location
  top: Location
}

export type MapFitToBoundsOptions = { animated: boolean }

export type MapRefMethods = {
  /**
   * Recenter the map to wherever the given location is.
   *
   */

  recenterToLocation: (givenLocation: Location) => void
}

export type MapProps<T extends MapMarker> = {
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

  /**
   * Handles the selection of a marker.
   *
   * @param marker a singular map marker that was passed in through `markers`.
   */
  onMarkerSelected?: (marker: T) => void

  /**
   * Forwards the coordinates of where a user long pressed on the map.
   */
  onLongPress?: (coordinates: Location) => void
}

export const DetailsMap = forwardRef(function ReffedMap<T extends MapMarker> (
  {
    initialRegion,
    marker,
    renderMarker,
    onMarkerSelected,
    style,
    canScroll = false,
    canRotate = false,
    canZoom = false,
    onLongPress
  }: MapProps<T>,
  ref: MutableRefObject<MapRefMethods>
) {
  const mapRef = useRef<MapView | null>(null)

  /**
   * Recenter on to the given marker.
   */
  function reCenter () {
    mapRef.current?.animateToRegion({
      latitude: marker.location.latitude,
      longitude: marker.location.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    })
  }

  return (
    <MapView
      ref={mapRef}
      style={style}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      rotateEnabled={canRotate}
      scrollEnabled={canScroll}
      loadingEnabled={true}
      toolbarEnabled={false}
      onMapReady={() => reCenter}
      onLongPress={(e) => onLongPress?.(e.nativeEvent.coordinate)}
      followsUserLocation={true}
      showsUserLocation={true}
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
            onPress={() => onMarkerSelected?.(marker)}
          >
            {renderMarker && renderMarker(marker)}
          </Marker>
        </>
      }
    </MapView>
  )
})

export default DetailsMap
