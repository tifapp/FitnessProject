import { Location } from "lib/location/Location"
import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef
} from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

/**
 * A type that can be rendered by a {@link Map}.
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
   * Fits the map on set of bounds.
   *
   * @param bounds See {@link MapBounds}.
   * @param options See {@link MapFitToBoundsOptions}.
   */
  fitToBounds: (bounds: MapBounds, options?: MapFitToBoundsOptions) => void
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
   * Renders a singular map marker that was passed in through `markers`.
   */
  renderMarker: (marker: T) => React.ReactNode

  /**
   * Renders a circle for a singular map marker that was passed in through `markers`.
   */
  renderCircle?: (marker: T) => React.ReactNode

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

/**
 * A view for rendering a google map.
 */
export const Map = forwardRef(function ReffedMap<T extends MapMarker> (
  {
    initialRegion,
    markers,
    renderMarker,
    renderCircle,
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

  useImperativeHandle(ref, () => ({
    fitToBounds: (bounds, options) => {
      mapRef.current?.fitToCoordinates(
        [bounds.bottom, bounds.left, bounds.right, bounds.top],
        options
      )
    }
  }))

  return (
    <View style={style}>
      <MapView
        ref={mapRef}
        style={fillStyle.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        rotateEnabled={canRotate}
        scrollEnabled={canScroll}
        loadingEnabled={true}
        toolbarEnabled={false}
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
              {renderMarker(marker)}
            </Marker>
            {renderCircle && renderCircle(marker)}
          </>
        ))}
      </MapView>
    </View>
  )
})

const fillStyle = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
})

export default Map
