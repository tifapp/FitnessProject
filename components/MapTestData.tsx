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
      title: "I'm Tiffer",
      location: {
        latitude: 36.923652,
        longitude: -121.726033
      }
    },
    {
      key: "2",
      title: "I'm Tif",
      location: {
        latitude: 36.943652,
        longitude: -121.716033
      }
    },
    {
      key: "3",
      title: "I'm Tiff",
      location: {
        latitude: 36.953652,
        longitude: -121.746033
      }
    },
    {
      key: "4",
      title: "I'm Tiffy",
      location: {
        latitude: 36.933652,
        longitude: -121.736033
      }
    }
  ],

  customizers: [
    {
      key: "1",
      color: "green",
      circleFillColor: "rgba(100, 0, 0, 0.5)",
      circleStrokeColor: "blue",
      circleStrokeWidth: 2
    },
    {
      key: "2",
      color: "yellow",
      circleFillColor: "rgba(0, 0, 100, 0.5)",
      circleStrokeColor: "red",
      circleStrokeWidth: 2
    },
    {
      key: "3",
      color: "blue",
      circleFillColor: "rgba(100, 0, 0, 0.5)",
      circleStrokeColor: "orange",
      circleStrokeWidth: 2
    },
    {
      key: "4",
      color: "red",
      circleFillColor: "rgba(100, 0, 0, 0.5)",
      circleStrokeColor: "yellow",
      circleStrokeWidth: 2
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
