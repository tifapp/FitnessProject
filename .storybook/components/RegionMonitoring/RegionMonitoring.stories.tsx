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
  getCurrentPositionAsync,
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
import React, { useMemo, useState } from "react"
import { Button, Modal, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EventRegion } from "TiFShared/domain-models/Event"
import {
  coordinateDistance,
  LocationCoordinate2D
} from "TiFShared/domain-models/LocationCoordinate2D"

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
  async (_, kind) => {
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
    return await storage.current()
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
        <StoryView />
      </TiFQueryClientProvider>
    </View>
  </SafeAreaProvider>
)

const DEFAULT_LOCATION = { latitude: 0, longitude: 0 }

const StoryView = () => {
  const initialData = {
    currentCoords: DEFAULT_LOCATION,
    arePermissionsGranted: false
  }

  const {
    data: { currentCoords, arePermissionsGranted } = initialData,
    status
  } = useQuery(
    ["region-monitoring-permissions"],
    async () => {
      await requestNotificationPermissionsAsync()
      await requestForegroundPermissionsAsync()
      const currentCoords = (await getCurrentPositionAsync())
        .coords as LocationCoordinate2D
      const arePermissionsGranted = (await requestBackgroundPermissionsAsync())
        .granted
      return { currentCoords, arePermissionsGranted }
    },
    {
      initialData
    }
  )
  if (status === "success" && !arePermissionsGranted) {
    return (
      <BodyText>
        You need to enable all the permissions to use this test harness.
      </BodyText>
    )
  } else if (status !== "success") {
    return <BodyText>Requesting Location Permissions...</BodyText>
  } else {
    return <MainView coords={currentCoords ?? DEFAULT_LOCATION} />
  }
}

const MainView = ({ coords }: { coords: LocationCoordinate2D }) => {
  const [arrivalRadiusMeters, setArrivalRadiusMeters] = useState(100)
  const [coordinate, setCoordinate] = useState<
    LocationCoordinate2D | undefined
  >()
  const region = useMemo(() => {
    if (!coordinate) return undefined
    return { arrivalRadiusMeters, coordinate }
  }, [arrivalRadiusMeters, coordinate])
  const [isShowingCoordinatePicker, setIsShowingCoordinatePicker] =
    useState(false)
  const [lastKnownCoordinate, setLastKnownCoordinate] =
    useState<LocationCoordinate2D>(coords)
  const monitor = useMemo(() => {
    const foregroundMonitor = new ForegroundEventRegionMonitor(
      async (callback) => {
        return await watchPositionAsync(
          { accuracy: LocationAccuracy.Highest },
          (location) => {
            callback(location.coords)
            setLastKnownCoordinate(location.coords)
          }
        )
      }
    )
    return new EventArrivalsTrackerRegionMonitor(tracker, foregroundMonitor)
  }, [])
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        paddingVertical: 24,
        paddingHorizontal: 24
      }}
    >
      <Title>Event Arrival Demo</Title>
      <Spacer />
      <Headline>
        Arrival Radius: <BodyText>{arrivalRadiusMeters} meters</BodyText>
      </Headline>
      <Spacer />
      <Slider
        maximumValue={1000}
        minimumValue={5}
        onValueChange={(arrivalRadiusMeters) => {
          if (coordinate) {
            tracker.replaceArrivals(
              EventArrivals.fromRegions([
                {
                  coordinate,
                  arrivalRadiusMeters,
                  eventIds: [0],
                  hasArrived: false
                }
              ])
            )
          }
          setArrivalRadiusMeters(arrivalRadiusMeters)
        }}
        step={1}
        value={Math.ceil(arrivalRadiusMeters)}
      />
      <Spacer />
      <Button
        title="Change Event Location"
        onPress={() => setIsShowingCoordinatePicker(true)}
      />

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
      <Modal visible={isShowingCoordinatePicker}>
        <CoordinatePickerView
          lastKnownCoordinate={lastKnownCoordinate}
          onSelected={(coordinate) => {
            tracker.replaceArrivals(
              EventArrivals.fromRegions([
                {
                  coordinate,
                  arrivalRadiusMeters,
                  eventIds: [0],
                  hasArrived: false
                }
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
  lastKnownCoordinate: LocationCoordinate2D
  onSelected: (coordinate: LocationCoordinate2D) => void
}

const CoordinatePickerView = ({
  lastKnownCoordinate,
  onSelected
}: CoordinatePickerProps) => (
  <View style={{ position: "relative" }}>
    <MapView
      initialRegion={{
        ...lastKnownCoordinate,
        longitudeDelta: 0.25,
        latitudeDelta: 0.25
      }}
      showsUserLocation={true}
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
        <Title>Tap and hold to select a location to arrive at.</Title>
      </View>
    </View>
  </View>
)

type RegionMonitoringProps = {
  monitor: EventRegionMonitor
  lastKnownCoordinate: LocationCoordinate2D
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
      <MapView
        initialRegion={{
          ...region.coordinate,
          longitudeDelta: 0.25,
          latitudeDelta: 0.25
        }}
        showsUserLocation={true}
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
        style={{ width: "100%", height: 150 }}
      >
        <Marker
          coordinate={region.coordinate}
          title={"Test Marker"}
          description={"This is a marker for testing purposes"}
        />
      </MapView>
      <Spacer />
      <BodyText>
        <Headline style={{ color: "brown" }}>
          {coordinateDistance(
            lastKnownCoordinate,
            region.coordinate,
            "meters"
          ).toFixed(2)}
          {" meters "}
        </Headline>
        from the Event Center
      </BodyText>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Headline>Current Coords</Headline>
          {lastKnownCoordinate && (
            <CoordinateLabel coordinate={lastKnownCoordinate} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Headline>Event Center</Headline>
          <CoordinateLabel coordinate={region.coordinate} />
        </View>
      </View>
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
          The arrival Banner will appear here when the foreground monitor
          detects that you've arrived at the region.
        </BodyText>
      )}
    </View>
  )
}

type CoordinateLabelProps = {
  coordinate: LocationCoordinate2D
}

const CoordinateLabel = ({ coordinate }: CoordinateLabelProps) => (
  <View>
    <BodyText>
      <Headline>Lat:</Headline> {coordinate.latitude.toFixed(7)}
    </BodyText>
    <BodyText>
      <Headline>Lng:</Headline> {coordinate.longitude.toFixed(7)}
    </BodyText>
  </View>
)
