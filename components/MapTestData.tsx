import { StyleSheet } from "react-native";

export const state = {
  //Area where you start the map at
    initialRegion: 
    {
      latitude: 34.059761,
      longitude: -118.276802,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    },
  //Our initial set of markers (events)
    markers: [
      {
        key: 1,
        place: "Event",
        lat: 34.079761,
        lng: -118.296802,
        pinColor: 'blue'
      },
      {
        key: 2,
        place: "Establishment",
        lat: 34.039761,
        lng: -118.256802,
        pinColor: 'green'
      }
    ],
    
    movementSettings: {
      canScroll: true,
      canZoom: true,
      canRotate: false,
    }
    
  }
  export const mapCompStyle = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: "flex-end",
      alignItems: "center"
    },
    map: {
      ...StyleSheet.absoluteFillObject
    }
  })