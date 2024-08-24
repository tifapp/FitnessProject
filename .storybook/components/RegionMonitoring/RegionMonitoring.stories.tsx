import React, { useMemo, useState } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
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
import { Button, Modal, View } from "react-native"
import {
  LocationAccuracy,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync
} from "expo-location"
import { BodyText, Headline, Title } from "@components/Text"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import Slider from "@react-native-community/slider"
import MapView from "react-native-maps"
import { EventArrivalBannerView } from "@event-details-boundary/ArrivalBanner"
import { StoryMeta } from ".storybook/HelperTypes"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { EventRegion } from "TiFShared/domain-models/Event"
import { Migrations, TiFSQLite } from "@lib/SQLite"
import { useQuery } from "@tanstack/react-query"
import {
  requestPermissionsAsync as requestNotificationPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler
} from "expo-notifications"

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

const StoryView = () => {
  const { data: arePermissionsGranted, status } = useQuery(
    ["region-monitoring-permissions"],
    async () => {
      await requestNotificationPermissionsAsync()
      await requestForegroundPermissionsAsync()
      return (await requestBackgroundPermissionsAsync()).granted
    },
    { initialData: false }
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
    return <MainView />
  }
}

const MainView = () => {
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
  const [lastKnownCoordinate, setLastKnownCoordinate] = useState<
    LocationCoordinate2D | undefined
  >()
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
        title="Select Coordinate"
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
      <Headline>Lat:</Headline> {coordinate.latitude}
    </BodyText>
    <BodyText>
      <Headline>Lng:</Headline> {coordinate.longitude}
    </BodyText>
  </View>
)
