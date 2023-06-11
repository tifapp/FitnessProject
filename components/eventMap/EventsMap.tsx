import { LocationCoordinate2D } from "lib/location/Location"
import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef
} from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { ExploreEventsMarkerView } from "../../screens/ExploreEvents/MapMarker"

/**
 * A type that will contain the information of a marker's appearance, and be rendered by the map.
 */
export type EventMarker = {
  id: string
  coordinates: LocationCoordinate2D
  attendeeCount: number
  color: string
  hostID: string
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

export type MapProps = {
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
  markers: EventMarker[]

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
   * Handles the selection of a marker.
   *
   * @param marker a singular map marker that was passed in through `markers`.
   */
  onMarkerSelected?: (marker: EventMarker) => void

  /**
   * Forwards the coordinates of where a user long pressed on the map.
   */
  onLongPress?: (coordinates: LocationCoordinate2D) => void
}

/**
 * A view for rendering a google map.
 */
export const EventsMap = forwardRef(function ReffedMap (
  {
    initialRegion,
    markers,
    onMarkerSelected,
    style,
    canScroll = true,
    canRotate = true,
    canZoom = true,
    onLongPress
  }: MapProps,
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
      showsMyLocationButton={false}
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
            key={marker.id}
            coordinate={{
              latitude: marker.coordinates.latitude,
              longitude: marker.coordinates.longitude
            }}
            onPress={() => onMarkerSelected?.(marker)}
          >
            {
              <ExploreEventsMarkerView
                color={marker.color}
                attendeeCount={marker.attendeeCount}
              />
            }
          </Marker>
        </>
      ))}
    </MapView>
  )
})

export default EventsMap
