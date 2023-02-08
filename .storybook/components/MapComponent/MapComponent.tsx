import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Height information: Gets how tall/wide the device in use is
interface Props {
  markers: {
  key: number,
  place: string,
  lat: number,
  lng: number,
  }[];
}

const deviceHeight = Dimensions.get("window").height
const deviceWidth = Dimensions.get("window").width

// Placeholder data to figure out how markers work; objects seem to work

// IDK PUT THE LOCATION YOU FETCH FROM THE LOCATION SERVICES HERE? Might be different, could just be placeholder
const area = {
  latitude: 34.059761,
  longitude: -118.276802,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421
}

// Function to use map in order to go through objects and use information from them, for marker locations/information


// Map view component itself
function MapComponent () {

  const mapMarkerCreations = () => {
    return state.markers.map((report) =>
    <Marker
    key = {report.key}
    title = {report.place}
    coordinate = {{ latitude: report.lat, longitude: report.lng }}
    >
    </Marker >)
  }

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
