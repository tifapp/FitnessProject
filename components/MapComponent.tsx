/* import React, { useState, useRef } from "react";
import { View, Text } from "react-native";
import MapView, { Circle } from "react-native-maps";

------ MAP VARIABLES GO HERE ----------
const mapRef = useRef(null);

const [area, setArea] = useState ({
    //IDK PUT THE LOCATION YOU FETCH FROM THE LOCATION SERVICES HERE? Might be different, could just be placeholder
        latitude:
        longitude:
        latitudeDelta:
        longitudeDelta:
});

const userArea = {
    //IDK PUT THE LOCATION YOU FETCH FROM THE LOCATION SERVICES HERE?
        latitude:
        longitude:
        latitudeDelta:
        longitudeDelta:
};

type Camera = {
    center: {
       latitude: number,
       longitude: number,
   },
   pitch: number,
   heading: number,

   zoom: number
}

------ MAP VARIABLES END HERE ----------

Plan: Needs to be fully zoomed out, to some degree
      Want: Can't zoom out anymore, can be zoomed in
        Set a maximum zoom level, set to max zoomed out
        Can only zoom in, and zoom out if already zoomed in
      At any point of zooming in, can be zoomed out fully with a button that appears
        In order to make this work, have an "initial zoom level" that's set at some point
        Only allow zooms to be smaller than it, and when they are, make button appear
        Button will set zoom to default level
        Return the latitudeDelta and longitudeDelta to the original zoom level, save this level

      Ideally pinch to zoom? zoomEnabled true
      Join event, but you exit the area of the event
      Zoom control default? zoomControlEnabled false, allow for the "Reset zoom" button, since goes in same spot
      Getting userLocation would work, but would probably want to have marker for current location? Not sure. showsUserLocation might need to be on
        If follows, then add in stuff where there's a certain "box" of the map that's visible
        Find the maximum of the map, showing visible
      Refresh map button might be useful. showsMyLocationButton might want to exist to be able
        Alternate: onRegionChangeComplete event data to refresh events that are shown when moving
      Cannot implement "limit" to the map, using react-native-maps
        Can however, implement onPanDrag to check if they drag to a certain part that's too far
        Will either:
            Refresh map to user location (might seem like error? prolly insert a brief text blurb)
            Refresh map to nearby the border (might be confusing)

export default MapComponent(){
    return (
    <View>

    ------  MAP VIEW GOES DOWN HERE ---------
        <MapView
            ref={mapRef}
            initialRegion={userArea}
            provider="google"

        >
        NEED TO HAVE DATA FROM EVENTS, CREATE CIRCLES TO REPRESENT EVENTS
        GET DATA TO PLACE CIRCLES, BASED ON EVENTS
        Events are a different kind of type from posts

        Create a fake EventFeed elsewhere to supply information regarding events, that I would fetch
        Allows for testing grabbing the info
        grab LatLngs, make them into circles

        FOR NOW, PUT TEST DATA
        <Circle center={Lat}

        <MapView />

    ------  MAP VIEW ENDS FROM HERE ---------

    </View>

    )
}

 */

import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

// Height information: Gets how tall/wide the device in use is
const deviceHeight = Dimensions.get("window").height
const deviceWidth = Dimensions.get("window").width

// Placeholder data to figure out how markers work; objects seem to work
const state = {
  markers: [
    {
      key: 1,
      place: "Place one",
      lat: 34.079761,
      lng: -118.296802
    },
    {
      key: 2,
      place: "Place two",
      lat: 34.039761,
      lng: -118.256802
    }
  ]
}

// IDK PUT THE LOCATION YOU FETCH FROM THE LOCATION SERVICES HERE? Might be different, could just be placeholder
const area = {
  latitude: 34.059761,
  longitude: -118.276802,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421
}

// Function to use map in order to go through objects and use information from them, for marker locations/information
const mapMarkerCreations = () => {
  return state.markers.map((report) =>
  <Marker
  key = {report.key}
  title = {report.place}
  coordinate = {{ latitude: report.lat, longitude: report.lng }}
  >
  </Marker >)
}

// Map view component itself
function MapComponent () {
  return (
    <View style={styles.container}>
      <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={area}
          rotateEnabled={false}
          scrollEnabled={false}
      >
      {mapMarkerCreations()}
      </MapView>
    </View>
  )
}

//
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: deviceHeight - 360,
    width: deviceWidth,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
})

export default MapComponent
