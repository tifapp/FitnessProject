import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useMemo, useState } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
  EventArrivalBannerView,
  ForegroundEventRegionMonitor,
  useHasArrivedAtRegion
} from "@event-details/arrival-tracking"
import { Button, Modal, View } from "react-native"
import {
  LocationAccuracy,
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync
} from "expo-location"
import { useRequestForegroundLocationPermissions } from "@location/UserLocation"
import { BodyText, Headline, Title } from "@components/Text"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { LocationCoordinate2D } from "@shared-models/Location"
import Slider from "@react-native-community/slider"
import MapView from "react-native-maps"
import { EventRegion } from "@shared-models/Event"

const RegionMonitoringMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Region Monitoring"
}

export default RegionMonitoringMeta

type RegionMonitoringStory = ComponentStory<typeof SettingsScreen>

export const Basic: RegionMonitoringStory = () => (
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
  const { data, status } = useRequestForegroundLocationPermissions()
  if (status === "success" && !data.granted) {
    return (
      <BodyText>
        You need to enable foreground location permissions to use this test
        harness.
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
  return (
    <View style={{ width: "100%", paddingHorizontal: 24 }}>
      <Headline>
        Radius: <BodyText>{arrivalRadiusMeters} meters</BodyText>
      </Headline>
      <Spacer />
      <Slider
        maximumValue={1000}
        minimumValue={5}
        onValueChange={setArrivalRadiusMeters}
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
          <RegionMonitoringView region={region} />
        </>
      )}
      <Modal visible={isShowingCoordinatePicker}>
        <CoordinatePickerView
          onSelected={(coordinate) => {
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
  region: EventRegion
}

const RegionMonitoringView = ({ region }: RegionMonitoringProps) => {
  const [lastKnownCoordinate, setLastKnownCoordinate] = useState<
    LocationCoordinate2D | undefined
  >()
  const monitor = useMemo(() => {
    return new ForegroundEventRegionMonitor(async (callback) => {
      return await watchPositionAsync(
        { accuracy: LocationAccuracy.Highest },
        (location) => {
          callback(location.coords)
          setLastKnownCoordinate(location.coords)
        }
      )
    })
  }, [])
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
