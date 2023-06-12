import { ExploreEventsMarkerView } from "@screens/ExploreEvents/MapMarker"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import React from "react"
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
}: ExploreEventsMapProps) => (
  <MapView
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
    {events.map((event) => (
      <Marker
        key={event.id}
        coordinate={event.coordinates}
        onPress={() => onEventSelected(event)}
      >
        <ExploreEventsMarkerView
          color={event.color}
          imageURL={event.host.profileImageURL}
          attendeeCount={event.attendeeCount}
        />
      </Marker>
    ))}
  </MapView>
)
