import { Location } from "lib/location/Location"
import React, { useState } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps"

// Type for the map markers, in order to separate their logic out
export interface MapMarker {
  key: string
  title: string
  location: Location
}

interface Props<T> {
  // Contain style specifically for style on container for map
  // Map style specifically for style on map
  containStyle?: StyleProp<ViewStyle>
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
  extractKey,
  initialRadius,
  containStyle,
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
        pinColor={"blue"}
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
          strokeColor="blue"
          strokeWidth={2}
          fillColor="rgba(100, 0, 0, 0.5)"
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
    <View style={containStyle}>
      <MapView
        style={mapStyle}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        ref={mapRef}
        rotateEnabled={movementSettings.canRotate}
        scrollEnabled={movementSettings.canScroll}
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

//

export default MapComponent
