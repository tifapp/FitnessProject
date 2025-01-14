import { ExploreEventsMarkerView } from "./MapMarker"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React, { memo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { ExploreEventsRegion } from "./Region"
import { useCoreNavigation } from "@components/Navigation"
import { AppStyles } from "@lib/AppColorStyle"
import { defaultEditFormValues } from "@event/EditFormValues"

export type ExploreEventsMapProps = {
  initialRegion: ExploreEventsRegion
  events: ClientSideEvent[]
  onRegionChanged: (region: ExploreEventsRegion) => void
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsMap = ({
  initialRegion,
  events,
  onRegionChanged,
  style
}: ExploreEventsMapProps) => {
  const { presentEditEvent } = useCoreNavigation()
  return (
    <MapView
      style={style}
      initialRegion={initialRegion}
      loadingEnabled
      toolbarEnabled={false}
      onLongPress={(e) => {
        presentEditEvent({
          ...defaultEditFormValues(),
          location: {
            coordinate: e.nativeEvent.coordinate,
            placemark: undefined
          }
        })
      }}
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
        <MarkerView key={event.id} event={event} />
      ))}
    </MapView>
  )
}

type MarkerProps = {
  event: ClientSideEvent
}

const MarkerView = memo(function MarkerView({ event }: MarkerProps) {
  const { pushEventDetails } = useCoreNavigation()
  return (
    <Marker
      key={event.id}
      tracksViewChanges={false}
      coordinate={event.location.coordinate}
      onPress={() => pushEventDetails(event.id)}
    >
      <ExploreEventsMarkerView
        color={AppStyles.primaryColor}
        hostName={event.host.name}
        imageURL={event.host.profileImageURL}
        attendeeCount={event.attendeeCount}
      />
    </Marker>
  )
})
