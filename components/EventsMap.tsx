import { LocationCoordinate2D } from "lib/location/Location"
import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef
} from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

/**
 * A type that can be rendered by a {@link EventsMap}.
 */
export interface MapMarker {
  key: string
  location: LocationCoordinate2D
}

export type MapBounds = {
  left: LocationCoordinate2D
  right: LocationCoordinate2D
  bottom: LocationCoordinate2D
  top: LocationCoordinate2D
}

export type MapFitToBoundsOptions = { animated: boolean }

export type MapRefMethods = {
  /**
   * Recenter the map to wherever the given location is.
   *
   */

  recenterToLocation: (givenLocation: LocationCoordinate2D) => void
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
   * A list of map markers to render.
   */
  markers: T[]

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
  onLongPress?: (coordinates: LocationCoordinate2D) => void
}

/**
 * A view for rendering a google map.
 */
export const EventsMap = forwardRef(function ReffedMap<T extends MapMarker> (
  {
    initialRegion,
    markers,
    renderMarker,
    onMarkerSelected,
    style,
    canScroll = true,
    canRotate = true,
    canZoom = true,
    onLongPress
  }: MapProps<T>,
  ref: MutableRefObject<MapRefMethods>
) {
  const mapRef = useRef<MapView | null>(null)
  const latlngDelta = 0.03

  useImperativeHandle(ref, () => ({
    recenterToLocation: (givenLocation) => {
      mapRef.current?.animateToRegion({
        latitude: givenLocation.latitude,
        longitude: givenLocation.longitude,
        latitudeDelta: latlngDelta,
        longitudeDelta: latlngDelta
      })
    }
  }))

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
      onLongPress={(e) => onLongPress?.(e.nativeEvent.coordinate)}
      followsUserLocation={true}
      moveOnMarkerPress={false}
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
      {markers.map((marker) => (
        <>
          <Marker
            key={marker.key}
            coordinate={{
              latitude: marker.location.latitude,
              longitude: marker.location.longitude
            }}
            onPress={() => onMarkerSelected?.(marker)}
          >
            {renderMarker?.(marker)}
          </Marker>
        </>
      ))}
    </MapView>
  )
})

export default EventsMap
