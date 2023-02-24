import { StyleSheet } from "react-native";

export const state = {
  //Area where you start the map at
    initialRegion: 
    {
      latitude: 36.933652,
      longitude: -121.736033,
      latitudeDelta: 0.0522,
      longitudeDelta: 0.0221
    },
  //Our initial set of markers (events)
    markers: [
      {
        key: 1,
        place: "I'm Tiffer",
        lat: 36.923652,
        lng: -121.726033,
        pinColor: 'blue',
        isSelected: false
      },
      {
        key: 2,
        place: "I'm Tif",
        lat: 36.943652,
        lng: -121.716033,
        pinColor: 'green',
        isSelected: false
      },
      {
        key: 3,
        place: "I'm Tiff",
        lat: 36.953652,
        lng: -121.746033,
        pinColor: 'red',
        isSelected: false
      },
      {
        key: 4,
        place: "I'm Tiffy",
        lat: 36.933652,
        lng: -121.736033,
        pinColor: 'purple',
        isSelected: false
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