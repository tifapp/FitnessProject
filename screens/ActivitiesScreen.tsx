import EventsList from "@components/EventsList"
import { TouchableIonicon } from "@components/common/Icons"
import EventsMap, { MapRefMethods } from "@components/eventMap/EventsMap"
import { useTrackUserLocation } from "@hooks/UserLocation"
import { AppStyles } from "@lib/AppColorStyle"
import { delayData } from "@lib/DelayData"
import { CurrentUserEvent, EventMocks } from "@lib/events"
import {
  UserLocationTrackingUpdate,
  requestLocationPermissions
} from "@lib/location/UserLocation"
import React, { useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import { useQuery } from "react-query"

const MARKER_SIZE = 44
const LATLNGDELTA = 0.5

const ActivitiesScreen = ({
  navFunction
}: {
  navFunction: (s: string, e: { event: CurrentUserEvent }) => void
}) => {
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

  const eventsQuery = useQuery(["/event", "GET"], () =>
    delayData([
      EventMocks.Multiday,
      EventMocks.NoPlacemarkInfo,
      EventMocks.PickupBasketball
    ])
  )

  const events = eventsQuery.data ?? []

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
