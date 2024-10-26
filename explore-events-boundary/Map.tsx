import { ExploreEventsMarkerView } from "./MapMarker"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { ExploreEventsRegion } from "./Region"

export type ExploreEventsMapProps = {
  initialRegion: ExploreEventsRegion
  events: ClientSideEvent[]
  onEventSelected: (event: ClientSideEvent) => void
  onRegionChanged: (region: ExploreEventsRegion) => void
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
    initialRegion={initialRegion}
    loadingEnabled
    toolbarEnabled={false}
    onLongPress={(e) => onLongPress(e.nativeEvent.coordinate)}
    moveOnMarkerPress={false}
    showsUserLocation
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
        coordinate={event.location.coordinate}
        onPress={() => onEventSelected(event)}
      >
        <ExploreEventsMarkerView
          color={event.color.toString()}
          imageURL={event.host.profileImageURL}
          attendeeCount={event.attendeeCount}
        />
      </Marker>
    ))}
  </MapView>
)
