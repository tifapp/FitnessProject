import EventsList from "@components/EventsList"
import EventsMap, { MapRefMethods } from "@components/eventMap/EventsMap"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import { useTrackUserLocation } from "@hooks/UserLocation"
import { CurrentUserEvent, EventMocks } from "@lib/events"
import {
  UserLocationTrackingUpdate,
  requestLocationPermissions
} from "@lib/location/UserLocation"
import React, { useEffect, useRef } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { Icon } from "react-native-elements"

const MARKER_SIZE = 44
const LATLNGDELTA = 0.5

const ActivitiesScreen = ({
  navFunction
}: {
  navFunction: (s: string, e: { event: CurrentUserEvent }) => void
}) => {
  const appRef = useRef<MapRefMethods | null>(null)
  let doesWork = false
  const givenUserLocation = useTrackUserLocation()

  const recenterToUserLocation = () => {
    if (givenUserLocation?.status === "success") {
      appRef.current?.recenterToLocation({
        latitude: givenUserLocation.location.coordinates.latitude,
        longitude: givenUserLocation.location.coordinates.longitude
      })
    }
  }

  const events: CurrentUserEvent[] = [
    EventMocks.Multiday,
    EventMocks.NoPlacemarkInfo,
    EventMocks.PickupBasketball
  ]

  useEffect(() => {
    ;(async () => {
      const status = await requestLocationPermissions()
      if (status === false) {
      } else {
        doesWork = true
      }
    })()
  }, [])

  function checkUserLocation (
    userLocationParam: UserLocationTrackingUpdate | undefined
  ) {
    if (userLocationParam?.status === "success") {
      return {
        latitude: userLocationParam.location.coordinates.latitude,
        longitude: userLocationParam.location.coordinates.longitude,
        latitudeDelta: LATLNGDELTA,
        longitudeDelta: LATLNGDELTA
      }
    } else {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: LATLNGDELTA,
        longitudeDelta: LATLNGDELTA
      }
    }
  }

  return (
    <>
      <EventsMap
        ref={appRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={checkUserLocation(givenUserLocation)}
        markers={events.map((event: CurrentUserEvent) => ({
          id: event.id,
          coordinates: event.coordinates,
          attendeeCount: event.attendeeCount,
          color: event.color,
          hostID: event.host.id
        }))}
      />

      <TouchableOpacity
        onPress={recenterToUserLocation}
        style={styles.recenterButton}
      >
        <Icon name="locate-outline" type="ionicon" color="white" size={30} />
      </TouchableOpacity>

      <EventsList />
      <EventTabBar />
    </>
  )
}

const styles = StyleSheet.create({
  recenterButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    position: "absolute",
    bottom: "20%",
    right: "5%",
    borderRadius: 15,
    backgroundColor: "black"
  }
})
export default ActivitiesScreen
