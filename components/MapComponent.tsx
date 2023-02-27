import { Location } from "lib/location/Location"
import React, { useState } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

// Type for the map markers, in order to separate their logic out
export interface mapMarker {
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

  markers: mapMarker[]

  movementSettings: {
    canScroll: boolean
    canZoom: boolean
    canRotate: boolean
  }

  extractKey: (event: any) => string
}

// Map view component itself
export function MapComponent<T extends mapMarker> ({
  initialRegion,
  markers,
  extractKey,
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

  // When clicking on the marker, zoom towards where it is.
  function onMarkerClick (lat: number, long: number) {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: long,
      latitudeDelta: initialRegion.latitudeDelta - 0.02,
      longitudeDelta: initialRegion.longitudeDelta - 0.02
    })
  }

  // When tapping "Re-Center" button, move to the marker in question.
  /* function onRecenter () {
    mapRef.current.animateToRegion({
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude,
      latitudeDelta: initialRegion.latitudeDelta,
      longitudeDelta: initialRegion.longitudeDelta
    })
  } */

  // Set the key of the marker that is selected.
  function onSelected (givenMapMarker: mapMarker) {
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
      </MapView>
    </View>
  )
}

//

export default MapComponent
