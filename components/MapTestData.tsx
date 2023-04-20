import { StyleSheet } from "react-native"

export const state = {
  // Area where you start the map at
  initialRegion: {
    latitude: 36.933652,
    longitude: -121.736033,
    latitudeDelta: 0.0522,
    longitudeDelta: 0.0221
  },
  // Our initial set of markers (events)
  markers: [
    {
      key: "1",
      location: {
        latitude: 36.923652,
        longitude: -121.726033
      }
    },
    {
      key: "2",
      location: {
        latitude: 36.943652,
        longitude: -121.716033
      }
    },
    {
      key: "3",
      location: {
        latitude: 36.953652,
        longitude: -121.746033
      }
    },
    {
      key: "4",
      location: {
        latitude: 36.933652,
        longitude: -121.736033
      }
    }
  ],

  movementSettings: {
    canScroll: true,
    canZoom: true,
    canRotate: false
  }
}
export const mapCompStyle = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  }
})
