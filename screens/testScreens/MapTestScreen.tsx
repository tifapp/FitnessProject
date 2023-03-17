import React from "react"
import { Map } from "@components/Map"
import { Text } from "react-native"

const initialRegion = {
  latitude: 36.933652,
  longitude: -121.736033,
  latitudeDelta: 0.0522,
  longitudeDelta: 0.0221
}

const markers = [
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
]

export const MapTestScreen = () => (
  <Map
    style={{ width: "100%", height: "100%" }}
    initialRegion={initialRegion}
    renderMarker={(item: (typeof markers)[0]) => <Text>{item.title}</Text>}
    circleForMarker={() => ({
      show: true,
      options: {
        fillColor: "#FF000088",
        strokeColor: "#FF0000",
        radiusMeters: 1000
      }
    })}
    markers={markers}
  />
)
