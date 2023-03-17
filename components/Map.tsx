import { Location } from "lib/location/Location"
import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useMemo,
  useRef
} from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps"

/**
 * Props to display a circle on the map. If `show` is set to true, then
 * a circle will be displayed on the map with the given options.
 *
 * See the `circleForMarker` prop on {@link Map}.
 */
export type MapCircleProps =
  | { show: false }
  | {
      show: true
      options: {
        strokeColor?: string
        fillColor?: string
        strokeWidth?: number
        radiusMeters: number
      }
    }

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
   * Returns a {@link MapCircleProps} for a given marker. If `show` is set to
   * true, the map displays a circle underneath the marker with the given options.
   */
  circleForMarker?: (marker: T) => MapCircleProps

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
    circleForMarker,
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

  const markersWithCircles = useMemo(
    () =>
      markers.map((marker) => ({
        marker,
        circleProps: circleForMarker?.(marker) ?? { show: false }
      })),
    [markers, circleForMarker]
  )

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
      {markersWithCircles.map(({ marker, circleProps }) => (
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
          {circleProps.show && (
            <Circle
              testID={`mapCircle-${marker.key}`}
              radius={circleProps.options.radiusMeters}
              center={{
                latitude: marker.location.latitude,
                longitude: marker.location.longitude
              }}
              fillColor={circleProps.options.fillColor}
              strokeColor={circleProps.options.strokeColor}
              strokeWidth={circleProps.options.strokeWidth}
            />
          )}
        </>
      ))}
    </MapView>
  )
})

export default Map
