import { degreesToRadians } from "@lib/Math"
import { ImageSource } from "aws-sdk/clients/lookoutvision"
import { Location } from "lib/location/Location"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps"

// Type for the map markers, in order to separate their logic out
export interface MapMarker {
  key: string
  title: string
  location: Location
}

export interface MarkerCustomize {
  key: string
  color: string
  icon?: ImageSource
  circleFillColor: string
  circleStrokeColor: string
  circleStrokeWidth: number
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
  customizers: MarkerCustomize[]

  currentSelectedMarker: String | undefined

  movementSettings: {
    canScroll: boolean
    canZoom: boolean
    canRotate: boolean
  }
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
  customizers,
  currentSelectedMarker,
  initialRadius,
  mapStyle,
  movementSettings
}: Props<T>) {
  // Map references
  const mapRef = React.useRef<MapView | null>(null)
  const markerData = markers.map((markedMarker) => {
    return {
      markedMarker,
      isSelected: markedMarker.key === currentSelectedMarker
    }
  })

  // Return the markers/circles so that they appear on the map
  const mapMarkerCreations = () => {
    return markerData.map((marker) => {
      const createdCircle = checkCircleKey(marker)
      return (
        <>
          <Marker
            key={marker.markedMarker.key}
            title={marker.markedMarker.title}
            coordinate={{
              latitude: marker.markedMarker.location.latitude,
              longitude: marker.markedMarker.location.longitude
            }}
            pinColor={customizationCreation(marker.markedMarker).color}
            onPress={() => {
              if (marker.isSelected) {
                centerMapOnMarker(
                  marker.markedMarker.location.latitude,
                  marker.markedMarker.location.longitude,
                  initialRadius.radius
                )
              }
            }}
          />
          {createdCircle}
        </>
      )
    })
  }

  // Check to see if the circle is for the right selected marker.
  const checkCircleKey = (point) => {
    if (point.markedMarker.key === currentSelectedMarker) {
      const { circleFillColor, circleStrokeColor, circleStrokeWidth } =
        customizationCreation(point.markedMarker)
      return (
        <Circle
          center={{
            latitude: point.markedMarker.location.latitude,
            longitude: point.markedMarker.location.longitude
          }}
          radius={initialRadius.radius}
          fillColor={circleFillColor}
          strokeColor={circleStrokeColor}
          strokeWidth={circleStrokeWidth}
        />
      )
    } else return undefined
  }

  //
  const customizationCreation = (marker: MapMarker) => {
    const match = customizers.find(({ key }) => key === marker.key)
    if (match) {
      return match
    } else {
      return {
        color: "gray",
        circleFillColor: "rgba(0, 0, 0, 0.5)",
        circleStrokeColor: "gray",
        circleStrokeWidth: 1
      }
    }
  }

  const centerMapOnMarker = (lat: number, lng: number, radius: number) => {
    const bounds = circleCoordinateGeneration(lat, lng, radius)
    mapRef.current.fitToCoordinates(bounds, {
      edgePadding: { top: 100, right: 100, bottom: 400, left: 100 },
      animated: true
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
