import { StoryMeta } from ".storybook/HelperTypes"
import {
  EventArrivals,
  EventArrivalsTracker,
  EventArrivalsTrackerRegionMonitor,
  EventRegionMonitor,
  ExpoEventArrivalsGeofencer,
  ForegroundEventRegionMonitor,
  SQLiteEventArrivalsStorage,
  useHasArrivedAtRegion
} from "@arrival-tracking"
import { BodyText, Headline, Title } from "@components/Text"
import { EventArrivalBannerView } from "@event-details-boundary/ArrivalBanner"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { Migrations, TiFSQLite } from "@lib/SQLite"
import Slider from "@react-native-community/slider"
import { useQuery } from "@tanstack/react-query"
import {
  LocationAccuracy,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync
} from "expo-location"
import {
  requestPermissionsAsync as requestNotificationPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler
} from "expo-notifications"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button, Modal, ScrollView, Switch, View } from "react-native"
import MapView, { MapMarker } from "react-native-maps"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EventRegion } from "TiFShared/domain-models/Event"
import {
  LocationCoordinate2D,
  coordinateDistance
} from "TiFShared/domain-models/LocationCoordinate2D"

const MT_FUJI_REGION = {
  coordinate: {
    latitude: 35.362888,
    longitude: 138.730981
  },
  arrivalRadiusMeters: 1000,
  hasArrived: false,
  eventIds: [1]
}

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

const storage = new SQLiteEventArrivalsStorage(
  new TiFSQLite("region-monitoring", Migrations.main)
)
const tracker = new EventArrivalsTracker(
  storage,
  ExpoEventArrivalsGeofencer.shared,
  async (region, kind) => {
    if (
      kind === "arrived" &&
      coordinateDistance(
        region.coordinate,
        MT_FUJI_REGION.coordinate,
        "meters"
      ) < 1000
    ) {
      await scheduleNotificationAsync({
        content: {
          title: "You've Reached the Top of Mt. Fuji!",
          body: "Hi Chetan! You have 30 seconds to reach the bottom, or else an avalanche will kill you! Time is ticking!!!"
        },
        trigger: null
      })
    } else {
      await scheduleNotificationAsync({
        content: {
          title: kind === "arrived" ? "Arrived!" : "Departed!",
          body:
            kind === "arrived"
              ? "You have entered the monitored region!"
              : "You have left the monitored region!"
        },
        trigger: null
      })
    }
    return EventArrivals.fromRegions([
      { ...region, hasArrived: kind === "arrived", eventIds: [0] }
    ])
  }
)
tracker.startTracking()
ExpoEventArrivalsGeofencer.shared.defineTask()

const RegionMonitoringMeta: StoryMeta = {
  title: "Region Monitoring"
}

export default RegionMonitoringMeta

export const Basic = () => (
  <SafeAreaProvider>
    <View
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <TiFQueryClientProvider>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ marginTop: 128 }}
        >
          <StoryView />
        </ScrollView>
      </TiFQueryClientProvider>
    </View>
  </SafeAreaProvider>
)

const StoryView = () => {
  const { data: arePermissionsGranted } = useQuery({
    queryKey: ["region-monitoring-permissions"],
    queryFn: async () => {
      const notificationsGranted = (await requestNotificationPermissionsAsync())
        .granted
      await requestForegroundPermissionsAsync()
      return (
        (await requestBackgroundPermissionsAsync()).granted &&
        notificationsGranted
      )
    },
    initialData: false
  })
  if (!arePermissionsGranted) {
    return (
      <BodyText>
        You need to enable all the permissions to use this test harness.
      </BodyText>
    )
  } else {
    return <MainView />
  }
}

const watchLocation = async (
  callback: (coordinate: LocationCoordinate2D) => void
) => {
  return await watchPositionAsync(
    { accuracy: LocationAccuracy.Highest },
    (location) => callback(location.coords)
  )
}

const foregroundMonitor = new ForegroundEventRegionMonitor(watchLocation)
const backgroundMonitor = new EventArrivalsTrackerRegionMonitor(
  tracker,
  foregroundMonitor
)

const MainView = () => {
  const [arrivalRadiusMeters, setArrivalRadiusMeters] = useState(100)
  const [coordinate, setCoordinate] = useState<
    LocationCoordinate2D | undefined
  >()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const region = useMemo(() => {
    if (!coordinate) return undefined
    return { arrivalRadiusMeters, coordinate }
  }, [arrivalRadiusMeters, coordinate])
  const [isShowingCoordinatePicker, setIsShowingCoordinatePicker] =
    useState(false)
  const [lastKnownCoordinate, setLastKnownCoordinate] = useState<
    LocationCoordinate2D | undefined
  >()
  const [monitor, setMonitor] = useState<EventRegionMonitor>(backgroundMonitor)
  useEffect(() => {
    const sub = watchLocation(setLastKnownCoordinate)
    return () => {
      sub.then((s) => s.remove())
    }
  }, [])
  useEffect(() => {
    tracker.trackedArrivals().then((arrivals) => {
      if (arrivals.regions.length > 0) {
        setArrivalRadiusMeters(arrivals.regions[0].arrivalRadiusMeters)
        setCoordinate(arrivals.regions[0].coordinate)
      }
    })
  }, [])
  const estimatedDistance =
    lastKnownCoordinate &&
    coordinate &&
    coordinateDistance(lastKnownCoordinate, coordinate, "meters")
  return (
    <View style={{ width: "100%", paddingHorizontal: 24 }}>
      <Headline>
        Radius: <BodyText>{arrivalRadiusMeters} meters</BodyText>
      </Headline>
      <Spacer />
      <Slider
        maximumValue={1000}
        minimumValue={5}
        onValueChange={(arrivalRadiusMeters) => {
          if (coordinate) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              tracker.replaceArrivals(
                EventArrivals.fromRegions([
                  {
                    coordinate,
                    arrivalRadiusMeters,
                    eventIds: [0],
                    hasArrived: false
                  },
                  MT_FUJI_REGION
                ])
              )
            }, 200)
          }
          setArrivalRadiusMeters(arrivalRadiusMeters)
        }}
        step={1}
        value={Math.ceil(arrivalRadiusMeters)}
      />
      <Spacer />
      <Button
        title="Select Coordinate"
        onPress={() => setIsShowingCoordinatePicker(true)}
      />
      {estimatedDistance && (
        <BodyText>
          <Headline>Estimated Distance:</Headline>{" "}
          {Math.trunc(estimatedDistance)} meters
        </BodyText>
      )}
      <Spacer />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <Headline>Use Foreground Monitor</Headline>
        <Switch
          value={monitor === foregroundMonitor}
          onValueChange={(newValue) =>
            setMonitor(newValue ? foregroundMonitor : backgroundMonitor)
          }
        />
      </View>
      {region && (
        <>
          <Spacer />
          <RegionMonitoringView
            monitor={monitor}
            lastKnownCoordinate={lastKnownCoordinate}
            region={region}
          />
        </>
      )}
      <Spacer />
      <View style={{ marginBottom: 150 }} />
      <Modal visible={isShowingCoordinatePicker}>
        <CoordinatePickerView
          onSelected={(coordinate) => {
            tracker.replaceArrivals(
              EventArrivals.fromRegions([
                {
                  coordinate,
                  arrivalRadiusMeters,
                  eventIds: [0],
                  hasArrived: false
                },
                MT_FUJI_REGION
              ])
            )
            setCoordinate(coordinate)
            setIsShowingCoordinatePicker(false)
          }}
        />
      </Modal>
    </View>
  )
}

const Spacer = () => <View style={{ paddingVertical: 16 }} />

type CoordinatePickerProps = {
  onSelected: (coordinate: LocationCoordinate2D) => void
}

const CoordinatePickerView = ({ onSelected }: CoordinatePickerProps) => (
  <View style={{ position: "relative" }}>
    <MapView
      onLongPress={(event) => {
        onSelected(event.nativeEvent.coordinate)
      }}
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
      showsUserLocation
      style={{ width: "100%", height: "100%" }}
    />
    <View
      style={{
        position: "absolute",
        bottom: 0,
        backgroundColor: "white",
        width: "100%"
      }}
    >
      <View style={{ padding: 24 }}>
        <Title>Tap and hold to select a location.</Title>
      </View>
    </View>
  </View>
)

type RegionMonitoringProps = {
  monitor: EventRegionMonitor
  lastKnownCoordinate?: LocationCoordinate2D
  region: EventRegion
}

const RegionMonitoringView = ({
  monitor,
  lastKnownCoordinate,
  region
}: RegionMonitoringProps) => {
  const hasArrived = useHasArrivedAtRegion(region, monitor)
  return (
    <View>
      <Headline>Monitoring Coordinate</Headline>
      <CoordinateLabel coordinate={region.coordinate} />
      <Spacer />
      <Headline>Current Location</Headline>
      {lastKnownCoordinate && (
        <CoordinateLabel coordinate={lastKnownCoordinate} />
      )}
      <Spacer />
      {hasArrived ? (
        <EventArrivalBannerView
          hasJoinedEvent
          countdown={{ secondsToStart: 200 }}
          canShareArrivalStatus={true}
          onClose={() => console.log("I will remain open forever!")}
          style={{ width: "100%" }}
        />
      ) : (
        <BodyText>
          The arrival Banner will appear here when the app detects that you have
          arrived at the region, and have stayed there for at least 20 seconds.
        </BodyText>
      )}
      <Spacer />
      <MapView
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
        showsUserLocation
        style={{ width: "100%", height: 350, borderRadius: 12 }}
      >
        <MapMarker coordinate={region.coordinate} />
      </MapView>
    </View>
  )
}

type CoordinateLabelProps = {
  coordinate: LocationCoordinate2D
}

const CoordinateLabel = ({ coordinate }: CoordinateLabelProps) => (
  <View>
    <BodyText>
      <Headline>Lat:</Headline> {coordinate.latitude}
    </BodyText>
    <BodyText>
      <Headline>Lng:</Headline> {coordinate.longitude}
    </BodyText>
  </View>
)
