import { degreesToRadians } from "@lib/Math"
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
  // Map style specifically for style on map
  mapStyle?: StyleProp<ViewStyle>

  initialRegion: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }

  markers: T[]

  canScroll?: boolean
  canZoom?: boolean
  canRotate?: boolean

  renderMarker: (marker: T) => React.ReactNode

  renderCircle?: (marker: T) => React.ReactNode

  onMarkerSelected?: (marker: T) => void

  onLongPress?: (coordinates: Location) => void
}

// When clicking on the marker, zoom towards where it is.
// Using stackOverflow formula
// stackoverflow.com/questions/5206018/fit-mapview-to-circle-bounds
function circleCoordinateGeneration (lat: number, long: number, radius: number) {
  const earthRadius = 6378.1 // km
  const circleLatitude0 = lat + degreesToRadians(-radius / earthRadius)
  const circleLatitude1 = lat + degreesToRadians(radius / earthRadius)
  const circleLongitude0 =
    long + degreesToRadians(-radius / earthRadius) / degreesToRadians(lat)
  const circleLongitude1 =
    long + degreesToRadians(radius / earthRadius) / degreesToRadians(lat)
  const bottomCoord = {
    latitude: circleLatitude0,
    longitude: long
  }
  const leftCoord = {
    latitude: lat,
    longitude: circleLongitude0
  }
  const rightCoord = {
    latitude: circleLatitude1,
    longitude: long
  }
  const topCoord = {
    latitude: lat,
    longitude: circleLongitude1
  }
  return [bottomCoord, leftCoord, rightCoord, topCoord]
}

// Map view component itself
export const Map = forwardRef(function ReffedMap<T extends MapMarker> (
  {
    initialRegion,
    markers,
    renderMarker,
    renderCircle,
    onMarkerSelected,
    mapStyle,
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
    <View style={mapStyle}>
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
