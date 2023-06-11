import { EventMarkerView } from "@components/eventMap/EventMarker"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import React, { useRef } from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

export type ExploreEventsMapProps = {
  initialRegion: Region
  events: CurrentUserEvent[]
  onEventSelected: (event: CurrentUserEvent) => void
  onRegionChanged: (region: Region) => void
  onLongPress: (coordinate: LocationCoordinate2D) => void
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsMap = ({
  initialRegion,
  events,
  onRegionChanged,
  onEventSelected,
  onLongPress,
  style
}: ExploreEventsMapProps) => {
  const mapRef = useRef<MapView | null>(null)

  return (
    <MapView
      ref={mapRef}
      style={style}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      loadingEnabled={true}
      toolbarEnabled={false}
      onLongPress={(e) => onLongPress(e.nativeEvent.coordinate)}
      followsUserLocation={true}
      moveOnMarkerPress={false}
      showsUserLocation={true}
      onRegionChangeComplete={(region) => onRegionChanged(region)}
      showsMyLocationButton={false}
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
      {events.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.coordinates.latitude,
            longitude: marker.coordinates.longitude
          }}
          onPress={() => onEventSelected(marker)}
        >
          {
            <EventMarkerView
              color={marker.color}
              attendeeCount={marker.attendeeCount}
            />
          }
        </Marker>
      ))}
    </MapView>
  )
}
