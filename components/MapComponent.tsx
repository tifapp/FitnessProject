import { degreesToRadians } from "@lib/Math"
import { Location } from "lib/location/Location"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

// Type for the map markers, in order to separate their logic out
export interface MapMarker {
  key: string
  title: string
  location: Location
}

interface Props<T> {
  // Map style specifically for style on map
  mapStyle?: StyleProp<ViewStyle>

  initialRegion: {
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  }

  initialRadius: {
    radius: number
  }

  markers: MapMarker[]

  currentSelectedMarker: String | undefined

  movementSettings: {
    canScroll: boolean
    canZoom: boolean
    canRotate: boolean
  }

  renderMarker: (marker: MapMarker) => React.ReactNode

  renderCircle?: (marker: MapMarker) => React.ReactNode

  onMarkerSelected?: (marker: MapMarker) => void
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
export function MapComponent<T extends MapMarker> ({
  initialRegion,
  markers,
  currentSelectedMarker,
  renderMarker,
  renderCircle,
  onMarkerSelected,
  initialRadius,
  mapStyle,
  movementSettings
}: Props<T>) {
  // Map references
  const mapRef = React.useRef<MapView | null>(null)

  // Return the markers/circles so that they appear on the map
  const mapMarkerCreations = () => {
    return markers.map((marker) => {
      return (
        <>
          <Marker
            key={marker.key}
            title={marker.title}
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
      )
    })
  }

  // Function to give the location of a long press, ideally for a pin place.
  function onPinPlace (lat: number, lng: number): Location {
    return {
      latitude: lat,
      longitude: lng
    }
  }

  return (
    <View style={mapStyle}>
      <MapView
        style={fillStyle.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        ref={mapRef}
        rotateEnabled={movementSettings.canRotate}
        scrollEnabled={movementSettings.canScroll}
        loadingEnabled={true}
        toolbarEnabled={false}
        onLongPress={(e) => {
          onPinPlace(
            e.nativeEvent.coordinate.latitude,
            e.nativeEvent.coordinate.longitude
          )
        }}
        followsUserLocation={true}
        showsUserLocation={true}
        zoomEnabled={movementSettings.canZoom}
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
        {mapMarkerCreations()}
      </MapView>
    </View>
  )
}

const fillStyle = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
})

export default MapComponent
