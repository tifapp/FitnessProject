import { ImageSource } from "aws-sdk/clients/lookoutvision"
import { Location } from "lib/location/Location"
import React, { useState } from "react"
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

  movementSettings: {
    canScroll: boolean
    canZoom: boolean
    canRotate: boolean
  }

  extractKey: (event: any) => string
}

// Map view component itself
export function MapComponent<T extends MapMarker> ({
  initialRegion,
  markers,
  customizers,
  extractKey,
  initialRadius,
  mapStyle,
  movementSettings
}: Props<T>) {
  // Map references
  const mapRef = React.useRef<MapView | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<String | undefined>()

  const markerData = markers.map((markedMarker) => {
    const key = extractKey(markedMarker)
    return {
      markedMarker,
      isSelected: key === selectedMarker
    }
  })

  // Return the markers so that they appear on the map
  const mapMarkerCreations = () => {
    return markerData.map((marker) => (
      <Marker
        key={marker.markedMarker.key}
        title={marker.markedMarker.title}
        coordinate={{
          latitude: marker.markedMarker.location.latitude,
          longitude: marker.markedMarker.location.longitude
        }}
        pinColor={customizationCreation(marker.markedMarker).color}
        onPress={() => {
          onMarkerClick(
            marker.markedMarker.location.latitude,
            marker.markedMarker.location.longitude
          )
          onSelected(marker.markedMarker)
        }}
      />
    ))
  }

  // Check to see if the circle is for the right selected marker.
  const checkCircleKey = (point) => {
    if (point.markedMarker.key === selectedMarker) {
      return (
        <Circle
          center={{
            latitude: point.markedMarker.location.latitude,
            longitude: point.markedMarker.location.longitude
          }}
          radius={initialRadius.radius}
          fillColor={customizationCreation(point.markedMarker).circleFillColor}
          strokeColor={
            customizationCreation(point.markedMarker).circleStrokeColor
          }
          strokeWidth={
            customizationCreation(point.markedMarker).circleStrokeWidth
          }
        />
      )
    }
  }

  const circleCreations = () => {
    return markerData.map((point) => {
      const createdCircle = checkCircleKey(point)
      return createdCircle
    })
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

  // When clicking on the marker, zoom towards where it is.
  function onMarkerClick (lat: number, long: number) {
    const circleLatDelta = initialRadius.radius / 111000
    const circleLngDelta = Math.abs(
      initialRadius.radius / (111000 * Math.cos((lat * Math.PI) / 180))
    )
    const northEastCoord = {
      latitude: lat + circleLatDelta,
      longitude: long + circleLngDelta
    }
    const southWestCoord = {
      latitude: lat - circleLatDelta,
      longitude: long - circleLngDelta
    }
    const bounds = [northEastCoord, southWestCoord]
    mapRef.current.fitToCoordinates(bounds, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true
    })
  }

  // Set the key of the marker that is selected.
  function onSelected (givenMapMarker: MapMarker) {
    setSelectedMarker(givenMapMarker.key)
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
        {circleCreations()}
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
