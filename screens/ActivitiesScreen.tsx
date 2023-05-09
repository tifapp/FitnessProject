import EventsList from "@components/EventsList"
import EventTabBar from "@components/bottomTabComponents/EventTabBar"
import { TouchableIonicon } from "@components/common/Icons"
import EventsMap, { MapRefMethods } from "@components/eventMap/EventsMap"
import { useTrackUserLocation } from "@hooks/UserLocation"
import { AppStyles } from "@lib/AppColorStyle"
import { CurrentUserEvent, EventMocks } from "@lib/events"
import {
  UserLocationTrackingUpdate,
  requestLocationPermissions
} from "@lib/location/UserLocation"
import React, { useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import EventDetails from "./EventDetails/EventDetails"

const LATLNGDELTA = 0.5

const MARKER_SIZE = 80

const ActivitiesScreen = () => {
  const appRef = useRef<MapRefMethods | null>(null)
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

      <TouchableIonicon
        style={styles.recenterButton}
        icon={{ name: "locate-outline", color: "white" }}
        onPress={recenterToUserLocation}
      />

      <EventsList />
      <EventTabBar />
    </>
  )
}

const styles = StyleSheet.create({
  recenterButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    position: "absolute",
    bottom: "20%",
    right: "5%",
    borderRadius: 12,
    backgroundColor: AppStyles.darkColor
  }
})
export default ActivitiesScreen
