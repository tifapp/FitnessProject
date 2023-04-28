import EventsList from "@components/EventsList"
import EventsMap, { MapRefMethods } from "@components/EventsMap"
import { state } from "@components/MapTestData"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import React, { useRef } from "react"
import { ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-elements"

const MARKER_SIZE = 80

const ActivitiesScreen = () => {
  const appRef = useRef<MapRefMethods | null>(null)
  const recenterThing = () => {
    appRef.current?.recenterToLocation(state.initialRegion)
  }
  return (
    <>
      <EventsMap
        ref={appRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={state.initialRegion}
        renderMarker={(item) => (
          <>
            {/* Solid white background for the image */}
            <ImageBackground
              source={require("../assets/Solid_white.svg.png")}
              style={{
                flex: 1,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                borderRadius: MARKER_SIZE / 2,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            />
            {/* The profile image itself */}
            <ImageBackground
              source={require("../assets/icon.png")}
              style={{
                marginTop: "3%",
                position: "absolute",
                width: MARKER_SIZE - 5,
                height: MARKER_SIZE - 5,
                borderRadius: MARKER_SIZE - 5 / 2,
                alignSelf: "center",
                overflow: "hidden"
              }}
            />
            {/* Ideally, badge showing current number of attendees */}
            <View
              style={{
                marginLeft: "30%",
                paddingHorizontal: 3,
                backgroundColor: "red",
                position: "absolute",
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Icon name="people" type="ionicon" color="white" />
              <Text
                style={{
                  paddingHorizontal: 4,
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "white"
                }}
              >
                {/* Ideally, add the event amount of attendees here */}
                {5}
              </Text>
            </View>
          </>
        )}
        markers={state.markers}
      />
      <TouchableOpacity
        onPress={recenterThing}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          position: "absolute",
          bottom: "20%",
          right: "80%",
          borderRadius: 15,
          backgroundColor: "black"
        }}
      >
        <Icon name="locate-outline" type="ionicon" color="white" size={30} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          position: "absolute",
          bottom: "20%",
          right: "4%",
          borderRadius: 15,
          backgroundColor: "black"
        }}
      >
        <Icon name="add-outline" type="ionicon" color="white" size={30} />
      </TouchableOpacity>
      <EventsList />
      <EventTabBar />
    </>
  )
}

export default ActivitiesScreen
